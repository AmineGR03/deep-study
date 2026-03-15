import chromadb
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from app.config import Config
import uuid
import ollama

# Embedding model (downloads automatically on first run)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB connection
chroma_client = chromadb.PersistentClient(path=Config.CHROMA_PATH)
collection = chroma_client.get_or_create_collection("deepstudy_docs")

# ── Ollama config ──
OLLAMA_MODEL = "qwen2.5:0.5b"  # Fix: qwen3.5:0.5b doesn't exist


def index_pdf(file_path: str, metadata: dict) -> list:
    """Extract, chunk, embed and index a PDF into ChromaDB."""
    reader = PdfReader(file_path)
    chunk_ids = []
    chunk_size = 500
    overlap = 50

    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if not text:
            continue

        start = 0
        while start < len(text):
            chunk_text = text[start:start + chunk_size].strip()
            if len(chunk_text) >= 50:
                chunk_id = str(uuid.uuid4())
                embedding = embedder.encode(chunk_text).tolist()
                collection.add(
                    ids=[chunk_id],
                    embeddings=[embedding],
                    documents=[chunk_text],
                    metadatas=[{
                        **metadata,
                        "page": page_num + 1,
                        "file_path": file_path
                    }]
                )
                chunk_ids.append(chunk_id)
            start += chunk_size - overlap

    return chunk_ids


def is_doc_related_question(question: str) -> bool:
    """Heuristic to decide if the question is about school documents."""
    keywords = [
        "cours", "tp", "exam", "examen", "chapitre", "exercice",
        "résumé", "définition", "explique", "document", "pdf",
        "question", "réponse", "fiche", "module", "matière",
        "course", "chapter", "exercise", "summary", "definition", "explain"
    ]
    return any(kw in question.lower() for kw in keywords)


def answer_question(question: str, filters: dict, history: list = []) -> dict:
    """
    Route to RAG pipeline if question is doc-related,
    otherwise respond as a general-purpose chatbot.
    history: list of {"role": "user"/"assistant", "content": "..."} (last 10 messages)
    """
    # Keep only last 10 messages for context window
    recent_history = history[-10:] if history else []

    if not is_doc_related_question(question):
        answer = call_llm_general(question, recent_history)
        return {"answer": answer, "sources": [], "mode": "general"}

    # RAG mode
    question_embedding = embedder.encode(question).tolist()
    clean_filters = {k: v for k, v in filters.items() if v} if filters else None

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=5,
        where=clean_filters
    )

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0] if "distances" in results else []

    SIMILARITY_THRESHOLD = 1.2
    filtered = [
        (doc, meta)
        for doc, meta, dist in zip(docs, metas, distances)
        if dist < SIMILARITY_THRESHOLD
    ] if distances else list(zip(docs, metas))

    if not filtered:
        return {
            "answer": "Aucun document pertinent trouvé pour cette question.",
            "sources": [],
            "mode": "rag"
        }

    context_parts = []
    sources = []
    for doc, meta in filtered:
        context_parts.append(f"[Page {meta['page']}] {doc}")
        sources.append({"page": meta["page"], "file": meta["file_path"]})

    context = "\n\n".join(context_parts)
    answer = call_llm_rag(question, context, recent_history)

    return {"answer": answer, "sources": sources, "mode": "rag"}


def call_llm_rag(question: str, context: str, history: list) -> str:
    """RAG-mode: answer based on document context + conversation history."""
    system_prompt = """Tu es un assistant pédagogique de l'EMSI.
Réponds uniquement en te basant sur le contexte extrait des cours fourni dans le premier message.
Si la réponse n'est pas dans le contexte, dis-le clairement.
Mentionne la page source quand c'est possible."""

    # Build messages: system + history + current question with context
    messages = [
        {"role": "system", "content": system_prompt},
        *history,
        {"role": "user", "content": f"Contexte :\n{context}\n\nQuestion : {question}"}
    ]

    try:
        response = ollama.chat(model=OLLAMA_MODEL, messages=messages)
        return response["message"]["content"]
    except ollama.ResponseError as e:
        return f"❌ Erreur Ollama : {str(e)} — vérifiez que le modèle est bien pulled : `ollama pull {OLLAMA_MODEL}`"
    except Exception as e:
        return f"❌ Erreur : {str(e)}"


def call_llm_general(question: str, history: list) -> str:
    """General-purpose mode: free conversation with history."""
    system_prompt = "Tu es un assistant intelligent et utile. Réponds de manière claire et concise."

    messages = [
        {"role": "system", "content": system_prompt},
        *history,
        {"role": "user", "content": question}
    ]

    try:
        response = ollama.chat(model=OLLAMA_MODEL, messages=messages)
        return response["message"]["content"]
    except ollama.ResponseError as e:
        return f"❌ Erreur Ollama : {str(e)} — vérifiez que le modèle est bien pulled : `ollama pull {OLLAMA_MODEL}`"
    except Exception as e:
        return f"❌ Erreur : {str(e)}"


def delete_document_vectors(chunk_ids: list):
    """Delete vectors for a document from ChromaDB."""
    if chunk_ids:
        collection.delete(ids=chunk_ids)