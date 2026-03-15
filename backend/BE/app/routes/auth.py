from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from bson import ObjectId
import bcrypt, datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    role = data.get("role")

    if role not in ["etudiant", "professeur", "admin"]:
        return jsonify({"error": "Role invalide"}), 400

    collection = db["etudiants"] if role == "etudiant" else db["professeurs"]

    if collection.find_one({"email": data["email"]}):
        return jsonify({"error": "Email deja utilise"}), 409

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())

    user = {
        "nom":           data.get("nom"),
        "prenom":        data.get("prenom"),
        "email":         data["email"],
        "password_hash": hashed,
        "role":          role,
        "filiere_id":    data.get("filiere_id"),
        "annee_id":      data.get("annee_id"),
        "specialite_id": data.get("specialite_id") if role == "etudiant" else None,
        "created_at":    datetime.datetime.utcnow(),
    }

    result = collection.insert_one(user)
    return jsonify({"message": "Compte cree", "id": str(result.inserted_id)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = db["etudiants"].find_one({"email": data["email"]}) or \
           db["professeurs"].find_one({"email": data["email"]}) or \
           db["admins"].find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    if not bcrypt.checkpw(data["password"].encode(), user["password_hash"]):
        return jsonify({"error": "Mot de passe incorrect"}), 401

    token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role":  user["role"],
            "email": user["email"]
        }
    )

    return jsonify({"token": token, "role": user["role"]}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()

    user = db["etudiants"].find_one({"_id": ObjectId(user_id)}) or \
           db["professeurs"].find_one({"_id": ObjectId(user_id)}) or \
           db["admins"].find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    return jsonify({
        "id":            str(user["_id"]),
        "nom":           user.get("nom"),
        "prenom":        user.get("prenom"),
        "email":         user.get("email"),
        "role":          user.get("role"),
        "filiere_id":    user.get("filiere_id"),
        "annee_id":      user.get("annee_id"),
        "specialite_id": user.get("specialite_id"),
    }), 200

@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    data = request.json

    # Find which collection the user is in
    collection_name = None
    if db["etudiants"].find_one({"_id": ObjectId(user_id)}):
        collection_name = "etudiants"
    elif db["professeurs"].find_one({"_id": ObjectId(user_id)}):
        collection_name = "professeurs"
    elif db["admins"].find_one({"_id": ObjectId(user_id)}):
        collection_name = "admins"
    else:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    allowed_fields = ["email", "filiere_id", "annee_id", "specialite_id", "nom", "prenom"]
    updates = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

    # Check email uniqueness if changing email
    if "email" in updates:
        for col in ["etudiants", "professeurs", "admins"]:
            existing = db[col].find_one({"email": updates["email"]})
            if existing and str(existing["_id"]) != user_id:
                return jsonify({"error": "Email déjà utilisé"}), 409

    db[collection_name].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updates}
    )

    # Return updated user
    user = db[collection_name].find_one({"_id": ObjectId(user_id)})
    return jsonify({
        "id":            str(user["_id"]),
        "nom":           user.get("nom"),
        "prenom":        user.get("prenom"),
        "email":         user.get("email"),
        "role":          user.get("role"),
        "filiere_id":    user.get("filiere_id"),
        "annee_id":      user.get("annee_id"),
        "specialite_id": user.get("specialite_id"),
    }), 200