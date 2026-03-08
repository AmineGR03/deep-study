from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()

def init_collections():
    collections_existantes = db.list_collection_names()

    collections = [
        "admins",
        "filieres",
        "specialites",
        "annees",
        "semestres",
        "etudiants",
        "professeurs",
        "matieres",
        "types_ressources",
        "ressources",
        "document_chunks",
        "conversations",
        "messages"
    ]

    for col in collections:
        if col not in collections_existantes:
            db.create_collection(col)
            print(f"✅ Collection créée : {col}")
        else:
            print(f"⚠️  Déjà existante : {col}")

    # ── Index utiles pour les performances ──

    # Etudiants & Professeurs : recherche par email rapide
    db["etudiants"].create_index("email", unique=True)
    db["professeurs"].create_index("email", unique=True)

    # Ressources : filtrage par filiere / matiere / annee
    db["ressources"].create_index("filiere_id")
    db["ressources"].create_index("matiere_id")
    db["ressources"].create_index("annee_id")

    # Document chunks : recherche par ressource
    db["document_chunks"].create_index("ressource_id")
    db["document_chunks"].create_index("matiere_id")

    # Messages : recherche par conversation
    db["messages"].create_index("conversation_id")

    # Conversations : recherche par étudiant
    db["conversations"].create_index("etudiant_id")

    print("\n🎉 Base de données initialisée avec succès !")


def seed_types_ressources():
    """Insère les types de ressources de base (COURS, TP, EXAM, RESUME)"""
    types = ["COURS", "TP", "EXAM", "RESUME"]
    collection = db["types_ressources"]

    for t in types:
        if not collection.find_one({"nom": t}):
            collection.insert_one({"nom": t})
            print(f"✅ Type inséré : {t}")
        else:
            print(f"⚠️  Déjà existant : {t}")


if __name__ == "__main__":
    init_collections()
    seed_types_ressources()