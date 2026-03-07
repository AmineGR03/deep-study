import chromadb
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from app.config import Config
import uuid

# Modèle d'embedding (se télécharge automatiquement la 1ère fois)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Connexion ChromaDB
chroma_client = chromadb.PersistentClient(path=Config.CHROMA_PATH)
collection = chroma_client.get_or_create_collection("deepstudy_docs")


def index_pdf(file_path: str, metadata: dict) -> list:
    """Extrait, découpe, vectorise et indexe un PDF dans ChromaDB."""
    reader = PdfReader(file_path)
    chunk_ids = []

    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if not text:
            continue

        # Découpage en chunks de ~500 caractères
        for i in range(0, len(text), 500):
            chunk_text = text[i:i+500].strip()
            if len(chunk_text) < 50:
                continue

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

    return chunk_ids


def answer_question(question: str, filters: dict) -> dict:
    """Recherche les chunks pertinents et génère une réponse."""
    question_embedding = embedder.encode(question).tolist()

    # Nettoyer les filtres vides
    clean_filters = {k: v for k, v in filters.items() if v}

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=5,
        where=clean_filters if clean_filters else None
    )

    if not results["documents"][0]:
        return {"answer": "Aucun document pertinent trouvé.", "sources": []}

    # Construire le contexte
    context_parts = []
    sources = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        context_parts.append(f"[Page {meta['page']}] {doc}")
        sources.append({
            "page": meta["page"],
            "file": meta["file_path"]
        })

    context = "\n\n".join(context_parts)
    answer = call_llm(question, context)

    return {"answer": answer, "sources": sources}


def call_llm(question: str, context: str) -> str:
    """Génère une réponse via Ollama (local) ou OpenAI."""
    prompt = f"""
Tu es un assistant pédagogique de l'EMSI.
Réponds uniquement en te basant sur ce contexte extrait des cours :

{context}

Question : {question}
Réponse (mentionne la page source) :
"""
    # ── Option Ollama (gratuit, local) ──
    try:
        import requests
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }, timeout=30)
        return response.json()["response"]

    except Exception:
        # ── Fallback : retourner le contexte brut si Ollama indisponible ──
        return f"Contexte trouvé :\n\n{context}"


def delete_document_vectors(chunk_ids: list):
    """Supprime les vecteurs d'un document de ChromaDB."""
    if chunk_ids:
        collection.delete(ids=chunk_ids)