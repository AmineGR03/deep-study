from flask import Blueprint, jsonify, request
from app import db
from app.middleware.auth_middleware import role_required
from bson import ObjectId
import bcrypt, datetime

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
@role_required("admin")
def stats():
    return jsonify({
        "etudiants":     db["etudiants"].count_documents({}),
        "professeurs":   db["professeurs"].count_documents({}),
        "documents":     db["ressources"].count_documents({}),
        "conversations": db["conversations"].count_documents({}),
    }), 200


@admin_bp.route("/users", methods=["GET"])
@role_required("admin")
def get_users():
    etudiants = list(db["etudiants"].find({}, {
        "_id": 1, "nom": 1, "prenom": 1, "email": 1,
        "role": 1, "filiere_id": 1, "annee_id": 1, "created_at": 1
    }))
    professeurs = list(db["professeurs"].find({}, {
        "_id": 1, "nom": 1, "prenom": 1, "email": 1,
        "role": 1, "created_at": 1
    }))

    for u in etudiants + professeurs:
        u["_id"] = str(u["_id"])
        if "created_at" in u:
            u["created_at"] = u["created_at"].isoformat()

    return jsonify({
        "etudiants":   etudiants,
        "professeurs": professeurs,
    }), 200


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    role = request.args.get("role")
    collection = "etudiants" if role == "etudiant" else "professeurs"
    db[collection].delete_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "Utilisateur supprimé"}), 200


@admin_bp.route("/professors", methods=["POST"])
@role_required("admin")
def create_professor():
    data = request.json
    if db["professeurs"].find_one({"email": data["email"]}):
        return jsonify({"error": "Email déjà utilisé"}), 409

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())
    db["professeurs"].insert_one({
        "nom":           data.get("nom"),
        "prenom":        data.get("prenom"),
        "email":         data["email"],
        "password_hash": hashed,
        "role":          "professeur",
        "created_at":    datetime.datetime.utcnow(),
        "updated_at":    datetime.datetime.utcnow(),
    })
    return jsonify({"message": "Professeur créé"}), 201