from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from app import db
from app.middleware.auth_middleware import role_required
from app.services.rag_service import answer_question
import datetime

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/ask", methods=["POST"])
@role_required("etudiant")
def ask():
    identity = get_jwt_identity()  # retourne l'ID (string)
    data = request.json

    question = data.get("question")
    if not question:
        return jsonify({"error": "Question manquante"}), 400

    filters = {
        "matiere_id": data.get("matiere_id", ""),
        "filiere_id": data.get("filiere_id", ""),
    }

    # Réponse RAG
    result = answer_question(question, filters)

    # Sauvegarder la conversation
    conversation_id = data.get("conversation_id")
    if not conversation_id:
        conv = db["conversations"].insert_one({
            "etudiant_id": identity,
            "titre": question[:50],
            "created_at": datetime.datetime.utcnow()
        })
        conversation_id = str(conv.inserted_id)

    db["messages"].insert_many([
        {
            "conversation_id": conversation_id,
            "sender": "etudiant",
            "contenu": question,
            "created_at": datetime.datetime.utcnow()
        },
        {
            "conversation_id": conversation_id,
            "sender": "assistant",
            "contenu": result["answer"],
            "sources": result["sources"],
            "created_at": datetime.datetime.utcnow()
        }
    ])

    return jsonify({**result, "conversation_id": conversation_id}), 200


@chat_bp.route("/history", methods=["GET"])
@role_required("etudiant")
def history():
    identity = get_jwt_identity()
    conversations = list(db["conversations"].find(
        {"etudiant_id": identity}
    ))
    for c in conversations:
        c["_id"] = str(c["_id"])
    return jsonify(conversations), 200

@chat_bp.route("/messages/<conversation_id>", methods=["GET"])
@role_required("etudiant")
def get_messages(conversation_id):
    messages = list(db["messages"].find(
        {"conversation_id": conversation_id}
    ).sort("created_at", 1))
    for m in messages:
        m["_id"] = str(m["_id"])
        if "created_at" in m:
            m["created_at"] = m["created_at"].isoformat()
    return jsonify(messages), 200