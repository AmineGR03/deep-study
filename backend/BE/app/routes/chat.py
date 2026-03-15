from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.middleware.auth_middleware import role_required
from app.services.rag_service import answer_question
import datetime
from bson import ObjectId
from flask_cors import CORS, cross_origin

chat_bp = Blueprint("chat", __name__)
CORS(chat_bp)


@chat_bp.route("/ask", methods=["POST", "GET", "OPTIONS"])
@role_required("etudiant")
@cross_origin()
def ask():
    identity = get_jwt_identity()
    data = request.json
    question = data.get("question")

    if not question:
        return jsonify({"error": "Question manquante"}), 400

    filters = {
        "matiere_id": data.get("matiere_id", ""),
        "filiere_id": data.get("filiere_id", ""),
    }

    # ── Fetch or create conversation ──
    conversation_id = data.get("conversation_id")
    if not conversation_id:
        conv = db["conversations"].insert_one({
            "etudiant_id": identity,
            "titre": question[:50],
            "created_at": datetime.datetime.utcnow()
        })
        conversation_id = str(conv.inserted_id)

    # ── Fetch last 10 messages from DB for context ──
    recent_messages = list(
        db["messages"]
        .find({"conversation_id": conversation_id})
        .sort("created_at", -1)  # newest first
        .limit(10)
    )
    # Reverse to get chronological order, then format for ollama
    recent_messages.reverse()
    history = [
        {
            "role": "user" if msg["sender"] == "etudiant" else "assistant",
            "content": msg["contenu"]
        }
        for msg in recent_messages
    ]

    # ── RAG / general answer with history ──
    result = answer_question(question, filters, history)

    # ── Save new messages to DB ──
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
            "sources": result.get("sources", []),
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
    ).sort("created_at", -1))  # newest first
    for c in conversations:
        c["_id"] = str(c["_id"])
        if "created_at" in c:
            c["created_at"] = c["created_at"].isoformat()
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


@chat_bp.route("/conversations/<conversation_id>", methods=["PATCH"])
@role_required("etudiant")
def update_conversation(conversation_id):
    data = request.json
    db["conversations"].update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"titre": data.get("titre")}}
    )
    return jsonify({"message": "Titre modifié"}), 200


@chat_bp.route("/conversations/<conversation_id>", methods=["DELETE"])
@role_required("etudiant")
def delete_conversation(conversation_id):
    db["messages"].delete_many({"conversation_id": conversation_id})
    db["conversations"].delete_one({"_id": ObjectId(conversation_id)})
    return jsonify({"message": "Conversation supprimée"}), 200