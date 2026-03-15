from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.middleware.auth_middleware import role_required
from app.services.rag_service import index_pdf, delete_document_vectors
from bson import ObjectId
import os, datetime

documents_bp = Blueprint("documents", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx", "txt"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@documents_bp.route("/upload", methods=["POST"])
@role_required("professeur", "admin")
def upload():
    file = request.files.get("file")
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Fichier invalide"}), 400

    metadata = {
        "matiere_id": request.form.get("matiere_id", ""),
        "filiere_id": request.form.get("filiere_id", ""),
        "annee_id":   request.form.get("annee_id", ""),
        "type":       request.form.get("type", "COURS"),
    }

    # Sauvegarder le fichier
    filename = secure_filename(file.filename)
    folder = os.path.join("uploads", metadata["filiere_id"], metadata["annee_id"])
    os.makedirs(folder, exist_ok=True)
    save_path = os.path.join(folder, filename)
    file.save(save_path)

    # Indexer dans ChromaDB si PDF
    chunk_ids = []
    if filename.endswith(".pdf"):
        chunk_ids = index_pdf(save_path, metadata)

    # Sauvegarder dans MongoDB
    doc = {
        "titre": request.form.get("titre", filename),
        "file_path": save_path,
        "chunk_ids": chunk_ids,
        "created_at": datetime.datetime.utcnow(),
        **metadata
    }
    result = db["ressources"].insert_one(doc)

    return jsonify({
        "message": "Document uploadé et indexé",
        "id": str(result.inserted_id),
        "chunks_indexes": len(chunk_ids)
    }), 201


@documents_bp.route("/list", methods=["GET"])
@role_required("etudiant", "professeur", "admin")
def list_documents():
    filters = {}
    for key in ["filiere_id", "matiere_id", "annee_id", "type"]:
        val = request.args.get(key)
        if val:
            filters[key] = val

    docs = list(db["ressources"].find(filters, {"chunk_ids": 0}))
    for doc in docs:
        doc["_id"] = str(doc["_id"])

    return jsonify(docs), 200


@documents_bp.route("/<doc_id>", methods=["DELETE"])
@role_required("admin", "professeur")
def delete_document(doc_id):
    doc = db["ressources"].find_one({"_id": ObjectId(doc_id)})
    if not doc:
        return jsonify({"error": "Document introuvable"}), 404

    # Purger ChromaDB
    delete_document_vectors(doc.get("chunk_ids", []))

    # Supprimer le fichier physique
    if os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])

    db["ressources"].delete_one({"_id": ObjectId(doc_id)})
    return jsonify({"message": "Document supprimé"}), 200