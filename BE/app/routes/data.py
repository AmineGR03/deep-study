from flask import Blueprint, request, jsonify
from app import db

data_bp = Blueprint("data", __name__)


@data_bp.route("/filieres", methods=["GET"])
def get_filieres():
    filieres = list(db["filieres"].find({}, {"_id": 1, "nom": 1, "label": 1}))
    for f in filieres:
        f["_id"] = str(f["_id"])
    return jsonify(filieres), 200


@data_bp.route("/annees", methods=["GET"])
def get_annees():
    annees = list(db["annees"].find(
        {}, {"_id": 1, "niveau": 1, "label": 1}
    ).sort("niveau", 1))
    for a in annees:
        a["_id"] = str(a["_id"])
    return jsonify(annees), 200


@data_bp.route("/specialites/<filiere_id>", methods=["GET"])
def get_specialites(filiere_id):
    specialites = list(db["specialites"].find(
        {"filiere_id": filiere_id},
        {"_id": 1, "nom": 1, "label": 1}
    ))
    for s in specialites:
        s["_id"] = str(s["_id"])
    return jsonify(specialites), 200


@data_bp.route("/matieres", methods=["GET"])
def get_matieres():
    filiere_id = request.args.get("filiere_id")
    annee_id   = request.args.get("annee_id")

    query = {}
    if filiere_id: query["filiere_id"] = filiere_id
    if annee_id:   query["annee_id"]   = annee_id

    matieres = list(db["matieres"].find(
        query, {"_id": 1, "nom": 1, "semestre": 1, "annee_id": 1}
    ))
    for m in matieres:
        m["_id"] = str(m["_id"])
    return jsonify(matieres), 200