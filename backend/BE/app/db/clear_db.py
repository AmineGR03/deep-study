from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()

collections = [
    "filieres", "specialites", "annees", "semestres",
    "etudiants", "professeurs", "matieres", "types_ressources",
    "ressources", "document_chunks", "conversations", "messages","admins"
]

def clear_db():
    print("⚠️  Suppression de toutes les données...\n")
    for col in collections:
        result = db[col].delete_many({})
        print(f"🗑️  {col} : {result.deleted_count} documents supprimés")
    print("\n✅ Base de données vidée avec succès !")

if __name__ == "__main__":
    confirm = input("⚠️  Es-tu sûr de vouloir vider toute la BD ? (oui/non) : ")
    if confirm.lower() == "oui":
        clear_db()
    else:
        print("❌ Annulé.")