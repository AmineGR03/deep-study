import chromadb
import fitz
from sentence_transformers import SentenceTransformer
from app.config import Config
import uuid
import requests
import re

# Embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB connection
chroma_client = chromadb.PersistentClient(path=Config.CHROMA_PATH)
collection = chroma_client.get_or_create_collection("deepstudy_docs")

# Groq config
GROQ_API_KEY = Config.GROQ_API_KEY
GROQ_MODEL   = "llama-3.3-70b-versatile"

ENV_PATTERN = r'(?:pmatrix|bmatrix|matrix|aligned|align|align\*|cases)'


def fix_latex_delimiters(text: str) -> str:
    if not text:
        return text

    unicode_map = [
        ('λ', r'\lambda'), ('σ', r'\sigma'), ('μ', r'\mu'),
        ('α', r'\alpha'), ('β', r'\beta'), ('ρ', r'\rho'),
        ('→', r'\rightarrow'), ('⟹', r'\Longrightarrow'),
        ('×', r'\times'), ('≈', r'\approx'), ('≤', r'\leq'),
        ('≥', r'\geq'), ('∑', r'\sum'), ('∈', r'\in'),
    ]

    # Splitter en blocs math et texte normal
    parts = re.split(r'(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)', text)

    result = []
    for part in parts:
        if part.startswith('$'):
            # Bloc math — remplacer unicode sans wrapper $...$
            for char, latex in unicode_map:
                part = part.replace(char, latex)
        else:
            # Texte normal — wrapper avec $...$
            for char, latex in unicode_map:
                part = part.replace(char, f'${latex}$')
        result.append(part)

    return ''.join(result)


def split_into_chunks(text: str, max_size: int = 1500, overlap: int = 150) -> list:
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) <= max_size:
            current += "\n\n" + para if current else para
        else:
            if current:
                chunks.append(current.strip())
            current = para

    if current:
        chunks.append(current.strip())

    return chunks


def index_pdf(file_path: str, metadata: dict) -> list:
    doc = fitz.open(file_path)
    chunk_ids = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        if not text or len(text.strip()) < 30:
            continue

        has_table = len(page.find_tables().tables) > 0
        chunks = [text.strip()] if has_table else split_into_chunks(text)

        for chunk_text in chunks:
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
                    "file_path": file_path,
                    "has_table": has_table
                }]
            )
            chunk_ids.append(chunk_id)

    print(f"✅ Indexed {len(chunk_ids)} chunks from {file_path}")
    return chunk_ids


def is_doc_related_question(question: str) -> bool:
    keywords = [
        "cours", "tp", "exam", "examen", "chapitre", "exercice",
        "résumé", "définition", "explique", "document", "pdf",
        "question", "réponse", "fiche", "module", "matière",
        "course", "chapter", "exercise", "summary", "definition", "explain"
    ]
    return any(kw in question.lower() for kw in keywords)


def call_groq(system_prompt: str, messages: list) -> str:
    if not GROQ_API_KEY:
        return "❌ Clé API Groq manquante — ajoutez GROQ_API_KEY dans .env"

    groq_messages = [
        {"role": "system", "content": system_prompt},
        *[m for m in messages if m["role"] in ["user", "assistant"]]
    ]

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "model":       GROQ_MODEL,
                "messages":    groq_messages,
                "max_tokens":  8192,
                "temperature": 0.3,
            },
            timeout=60
        )
        data = response.json()

        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        elif "error" in data:
            return f"❌ Erreur Groq : {data['error']['message']}"
        else:
            return "❌ Réponse inattendue de l'API Groq"

    except requests.exceptions.Timeout:
        return "❌ Timeout — Groq n'a pas répondu à temps"
    except Exception as e:
        return f"❌ Erreur : {str(e)}"


MATH_FORMAT_RULES = """
For all mathematical expressions:
- Use $...$ for inline math
- Use $$...$$ for display/block math
- Never use \\(...\\) or \\[...\\]
- Never split a single expression across multiple $$ blocks
- Never mix LaTeX with plain text inside $$ blocks

RÈGLES STRICTES pour les formules mathématiques :
- TOUJOURS utiliser $...$ pour les formules inline
- TOUJOURS utiliser $$...$$ sur une ligne séparée pour les formules en bloc
- NE JAMAIS utiliser \\[ \\] ou \\( \\)
- NE JAMAIS écrire de symboles mathématiques en texte Unicode (ex: λ, σ, →, ×)
- TOUJOURS écrire les symboles en LaTeX : $\\lambda$, $\\sigma$, $\\rightarrow$, $\\times$
- NE JAMAIS mélanger du texte Unicode et du LaTeX dans la même expression
- Exemple correct : La valeur propre $\\lambda_1 = 1.94$ est obtenue par...
- Exemple correct bloc :
$$
\\lambda_{1,2} = \\frac{2 \\pm \\sqrt{4 - 4 \\cdot 0.11}}{2}
$$"""


def call_llm_rag(question: str, context: str, history: list) -> str:
    system_prompt = f"""Tu es un assistant pédagogique de l'EMSI.
Tu as accès à des extraits de cours, examens et TP de l'étudiant.
Utilise le contexte fourni pour répondre. Si le contexte contient des exercices, détaille les solutions étape par étape avec toutes les formules et calculs.
Si le contexte ne suffit pas, complète avec tes connaissances générales en le précisant.
Cite toujours la page source entre crochets [Page X] quand c'est possible.
Réponds toujours en français de manière complète et pédagogique.
{MATH_FORMAT_RULES}"""

    messages = [
        *history,
        {"role": "user", "content": f"Contexte :\n{context}\n\nQuestion : {question}"}
    ]

    result = call_groq(system_prompt, messages)
    return fix_latex_delimiters(result)


def call_llm_general(question: str, history: list) -> str:
    system_prompt = f"""Tu es un assistant pédagogique intelligent de l'EMSI.
Réponds de manière claire, complète et pédagogique en français.
{MATH_FORMAT_RULES}"""

    messages = [
        *history,
        {"role": "user", "content": question}
    ]

    result = call_groq(system_prompt, messages)
    return fix_latex_delimiters(result)

def answer_question(question: str, filters: dict, history: list = []) -> dict:
    recent_history = history[-10:] if history else []

    greetings = ["hi", "hello", "bonjour", "salut", "slt", "bonsoir", "hey", "coucou"]
    if len(question.strip().split()) <= 2 or question.strip().lower() in greetings:
        answer = call_llm_general(question, recent_history)
        return {"answer": answer, "sources": [], "mode": "general"}

    # RAG seulement si une matière est explicitement sélectionnée
    if filters and filters.get("matiere_id"):
        return _answer_rag(question, filters, recent_history)

    # Sinon toujours général, jamais de sources
    answer = call_llm_general(question, recent_history)
    return {"answer": answer, "sources": [], "mode": "general"}


def _answer_rag(question: str, filters: dict, recent_history: list) -> dict:
    question_embedding = embedder.encode(question).tolist()

    non_empty = {k: v for k, v in filters.items() if v} if filters else {}
    if len(non_empty) == 0:
        clean_filters = None
    elif len(non_empty) == 1:
        clean_filters = {k: {"$eq": v} for k, v in non_empty.items()}
    else:
        clean_filters = {"$and": [{k: {"$eq": v}} for k, v in non_empty.items()]}

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=20,
        where=clean_filters
    )

    docs      = results["documents"][0]
    metas     = results["metadatas"][0]
    distances = results["distances"][0] if "distances" in results else []

    filtered = [
        (doc, meta)
        for doc, meta, dist in zip(docs, metas, distances)
        if dist < 2.0
    ] if distances else list(zip(docs, metas))

    if not filtered:
        answer = call_llm_general(question, recent_history)
        return {"answer": answer, "sources": [], "mode": "general"}

    context_parts = []
    sources = []
    for doc, meta in filtered:
        context_parts.append(f"[Page {meta['page']}] {doc}")
        sources.append({"page": meta["page"], "file": meta["file_path"]})

    context = "\n\n".join(context_parts)
    answer  = call_llm_rag(question, context, recent_history)
    return {"answer": answer, "sources": sources, "mode": "rag"}


def delete_document_vectors(chunk_ids: list):
    if chunk_ids:
        collection.delete(ids=chunk_ids)