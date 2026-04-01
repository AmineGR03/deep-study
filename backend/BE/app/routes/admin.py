# from flask import Blueprint, jsonify, request
# from app import db
# from app.middleware.auth_middleware import role_required
# from bson import ObjectId
# import bcrypt, datetime

# admin_bp = Blueprint("admin", __name__)


# @admin_bp.route("/stats", methods=["GET"])
# @role_required("admin")
# def stats():
#     return jsonify({
#         "etudiants":     db["etudiants"].count_documents({}),
#         "professeurs":   db["professeurs"].count_documents({}),
#         "documents":     db["ressources"].count_documents({}),
#         "conversations": db["conversations"].count_documents({}),
#     }), 200


# @admin_bp.route("/users", methods=["GET"])
# @role_required("admin")
# def get_users():
#     etudiants = list(db["etudiants"].find({}, {
#         "_id": 1, "nom": 1, "prenom": 1, "email": 1,
#         "role": 1, "filiere_id": 1, "annee_id": 1, "created_at": 1
#     }))
#     professeurs = list(db["professeurs"].find({}, {
#         "_id": 1, "nom": 1, "prenom": 1, "email": 1,
#         "role": 1, "created_at": 1
#     }))

#     for u in etudiants + professeurs:
#         u["_id"] = str(u["_id"])
#         if "created_at" in u:
#             u["created_at"] = u["created_at"].isoformat()

#     return jsonify({
#         "etudiants":   etudiants,
#         "professeurs": professeurs,
#     }), 200


# @admin_bp.route("/users/<user_id>", methods=["DELETE"])
# @role_required("admin")
# def delete_user(user_id):
#     role = request.args.get("role")
#     collection = "etudiants" if role == "etudiant" else "professeurs"
#     db[collection].delete_one({"_id": ObjectId(user_id)})
#     return jsonify({"message": "Utilisateur supprimé"}), 200


# @admin_bp.route("/professors", methods=["POST"])
# @role_required("admin")
# def create_professor():
#     data = request.json
#     if db["professeurs"].find_one({"email": data["email"]}):
#         return jsonify({"error": "Email déjà utilisé"}), 409

#     hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())
#     db["professeurs"].insert_one({
#         "nom":           data.get("nom"),
#         "prenom":        data.get("prenom"),
#         "email":         data["email"],
#         "password_hash": hashed,
#         "role":          "professeur",
#         "created_at":    datetime.datetime.utcnow(),
#         "updated_at":    datetime.datetime.utcnow(),
#     })
#     return jsonify({"message": "Professeur créé"}), 201



from flask import Blueprint, jsonify, request
from app import db
from app.middleware.auth_middleware import role_required
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity
import bcrypt, datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/stats", methods=["GET"])
@role_required("admin")
def stats():
    # Stats de base
    total_etudiants     = db["etudiants"].count_documents({})
    total_professeurs   = db["professeurs"].count_documents({})
    total_documents     = db["ressources"].count_documents({})
    total_conversations = db["conversations"].count_documents({})

    # Répartition documents par type
    by_type = list(db["ressources"].aggregate([
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]))

    # Répartition documents par filière
    by_filiere_raw = list(db["ressources"].aggregate([
        {"$group": {"_id": "$filiere_id", "count": {"$sum": 1}}}
    ]))
    by_filiere = []
    for f in by_filiere_raw:
        if f["_id"]:
            try:
                filiere = db["filieres"].find_one({"_id": ObjectId(f["_id"])})
                name = filiere["nom"] if filiere else f["_id"]
            except:
                name = f["_id"]
        else:
            name = "Non défini"
        by_filiere.append({"nom": name, "count": f["count"]})

    # Répartition documents par matière
    by_matiere_raw = list(db["ressources"].aggregate([
        {"$group": {"_id": "$matiere_id", "count": {"$sum": 1}}}
    ]))
    by_matiere = []
    for m in by_matiere_raw:
        if m["_id"]:
            try:
                matiere = db["matieres"].find_one({"_id": ObjectId(m["_id"])})
                name = matiere["nom"] if matiere else m["_id"]
            except:
                name = m["_id"]
        else:
            name = "Non défini"
        by_matiere.append({"nom": name, "count": m["count"]})

    # Étudiants par filière
    etudiants_by_filiere_raw = list(db["etudiants"].aggregate([
        {"$group": {"_id": "$filiere_id", "count": {"$sum": 1}}}
    ]))
    etudiants_by_filiere = []
    for f in etudiants_by_filiere_raw:
        if f["_id"]:
            try:
                filiere = db["filieres"].find_one({"_id": ObjectId(f["_id"])})
                name = filiere["nom"] if filiere else f["_id"]
            except:
                name = f["_id"]
        else:
            name = "Non défini"
        etudiants_by_filiere.append({"nom": name, "count": f["count"]})

    # Documents récents
    recent_docs = list(db["ressources"].find(
        {},
        {"titre": 1, "type": 1, "created_at": 1, "filiere_id": 1, "matiere_id": 1}
    ).sort("created_at", -1).limit(5))
    for doc in recent_docs:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
        if doc.get("filiere_id"):
            try:
                filiere = db["filieres"].find_one({"_id": ObjectId(doc["filiere_id"])})
                doc["filiere_nom"] = filiere["nom"] if filiere else "—"
            except:
                doc["filiere_nom"] = "—"

    return jsonify({
        "etudiants":            total_etudiants,
        "professeurs":          total_professeurs,
        "documents":            total_documents,
        "conversations":        total_conversations,
        "by_type":              by_type,
        "by_filiere":           by_filiere,
        "by_matiere":           by_matiere,
        "etudiants_by_filiere": etudiants_by_filiere,
        "recent_docs":          recent_docs,
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

@admin_bp.route("/professor/stats", methods=["GET"])
@role_required("professeur", "admin")
def professor_stats():
    identity = get_jwt_identity()

    # Chercher par uploaded_by OU tous les docs si uploaded_by absent
    # Pour compatibilité avec les anciens docs sans uploaded_by,
    # on cherche soit par uploaded_by, soit on retourne tous
    query = {"$or": [
        {"uploaded_by": identity},
        {"uploaded_by": {"$exists": False}}
    ]}

    total_docs = db["ressources"].count_documents(query)

    types_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    types_data = list(db["ressources"].aggregate(types_pipeline))

    filieres_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$filiere_id", "count": {"$sum": 1}}}
    ]
    filieres_raw = list(db["ressources"].aggregate(filieres_pipeline))

    from bson import ObjectId
    filieres_data = []
    for f in filieres_raw:
        if f["_id"]:
            try:
                filiere = db["filieres"].find_one({"_id": ObjectId(f["_id"])})
                name = filiere["nom"] if filiere else f["_id"]
            except:
                name = f["_id"]
        else:
            name = "Non défini"
        filieres_data.append({"nom": name, "count": f["count"]})

    recent = list(db["ressources"].find(
        query,
        {"titre": 1, "type": 1, "created_at": 1, "filiere_id": 1}
    ).sort("created_at", -1).limit(7))

    for doc in recent:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()

    return jsonify({
        "total_docs":  total_docs,
        "by_type":     types_data,
        "by_filiere":  filieres_data,
        "recent_docs": recent,
    }), 200



