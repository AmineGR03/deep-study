from pymongo import MongoClient
from dotenv import load_dotenv
import datetime, os
import bcrypt

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()

# ── 1. Filières ──
db["filieres"].delete_many({})
filieres = [
    {"nom": "IIR",   "label": "Ingénierie Informatique et Réseaux"},
    {"nom": "GESI",  "label": "Génie Électrique et Systèmes Intelligents"},
    {"nom": "IAII",  "label": "Ingénierie Automatisme et Informatique Industrielle"},
    {"nom": "GCBTP", "label": "Génie Civil, Bâtiments et Travaux Publics"},
    {"nom": "GI",    "label": "Génie Industriel"},
    {"nom": "GF",    "label": "Génie Financier"},
]
result = db["filieres"].insert_many(filieres)
iir_id = result.inserted_ids[0]
print("✅ Filières insérées")

# ── 2. Années ──
db["annees"].delete_many({})
annees = [
    {"niveau": 1, "label": "1ère année"},
    {"niveau": 2, "label": "2ème année"},
    {"niveau": 3, "label": "3ème année"},
    {"niveau": 4, "label": "4ème année"},
    {"niveau": 5, "label": "5ème année"},
]
result = db["annees"].insert_many(annees)
annee1_id = result.inserted_ids[0]
annee2_id = result.inserted_ids[1]
annee3_id = result.inserted_ids[2]
annee4_id = result.inserted_ids[3]
annee5_id = result.inserted_ids[4]
print("✅ Années insérées")

# ── 3. Spécialités IIR ──
db["specialites"].delete_many({})
specialite_id1 = db["specialites"].insert_one({
    "nom": "DDSI",
    "label": "Développement Digital & Systèmes d'Information",
    "filiere_id": str(iir_id),
    "created_at": datetime.datetime.utcnow()
}).inserted_id
specialite_id2 = db["specialites"].insert_one({
    "nom": "IASD",
    "label": "Intelligence Artificielle & Sciences des Données",
    "filiere_id": str(iir_id),
    "created_at": datetime.datetime.utcnow()
}).inserted_id
specialite_id3 = db["specialites"].insert_one({
    "nom": "CIR",
    "label": "Cybersécurité & Infrastructures Réseaux",
    "filiere_id": str(iir_id),
    "created_at": datetime.datetime.utcnow()
}).inserted_id
print("✅ Spécialités insérées")

# ── 4. Semestres ──
db["semestres"].delete_many({})
semestres = []
for annee_id, niveau in [
    (annee1_id, 1), (annee2_id, 2), (annee3_id, 3),
    (annee4_id, 4), (annee5_id, 5),
]:
    semestres.append({"numero": 1, "label": f"S{(niveau-1)*2+1}", "annee_id": str(annee_id), "created_at": datetime.datetime.utcnow()})
    semestres.append({"numero": 2, "label": f"S{(niveau-1)*2+2}", "annee_id": str(annee_id), "created_at": datetime.datetime.utcnow()})
db["semestres"].insert_many(semestres)
print("✅ Semestres insérés")

# ── 5. Types de ressources ──
db["types_ressources"].delete_many({})
db["types_ressources"].insert_many([
    {"nom": "COURS",  "created_at": datetime.datetime.utcnow(), "updated_at": datetime.datetime.utcnow()},
    {"nom": "TP",     "created_at": datetime.datetime.utcnow(), "updated_at": datetime.datetime.utcnow()},
    {"nom": "EXAM",   "created_at": datetime.datetime.utcnow(), "updated_at": datetime.datetime.utcnow()},
    {"nom": "RESUME", "created_at": datetime.datetime.utcnow(), "updated_at": datetime.datetime.utcnow()},
])
print("✅ Types de ressources insérés")

# ── 6. Matières ──
db["matieres"].delete_many({})
matieres = [
    # ── 3ème année IIR — Semestre 1 ──
    {"nom": "Intermediate English 1",                  "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Programmation Orientée Objet",            "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Conception des Systèmes d'Information",   "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Informatique Responsable",                "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Communication Professionnelle 1",         "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Compilation",                             "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Développement Web",                       "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Système d'Exploitation 3 (UNIX)",         "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Réseaux Informatiques",                   "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Programmation PHP & Framework",           "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "POO (TP)",                                "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Bases de Données 2 (SQL, PL/SQL Oracle)", "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},

    # ── 3ème année IIR — Semestre 2 ──
    {"nom": "Recherche Scientifique",                  "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Conception Orientée Objet",               "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Communication Professionnelle 2",         "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Programmation Java",                      "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "SQL Server",                              "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Programmation Linéaire",                  "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Réseaux Informatiques 2",                 "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Programmation Python & Framework",        "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Intermediate English 2",                  "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Modèles Statistiques",                    "filiere_id": str(iir_id), "annee_id": str(annee3_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},

    # ── 4ème année IIR — Semestre 1 ──
    {"nom": "Programmation Avancée",                   "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Dot Net",                                 "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "NoSQL",                                   "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Développement Mobile",                    "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Administration Unix",                     "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Virtualisation",                          "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "English 3",                               "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Communication 3",                         "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Administration Oracle",                   "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Analyse de Données",                      "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "Recherche Opérationnelle",                "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},
    {"nom": "IA/ML",                                   "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 1, "created_at": datetime.datetime.utcnow()},

    # ── 4ème année IIR — Semestre 2 ──
    {"nom": "Advanced English 2",                      "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Sécurité des Applications",               "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Gestion de Projet",                       "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Architecture et Programmation IoT",       "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Administration Oracle 2",                 "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Communication Professionnelle 4",         "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Génie Logiciel",                          "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Développement Front End",                 "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Sécurité des Réseaux",                    "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Entrepreneuriat",                         "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Architecture JEE",                        "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
    {"nom": "Écosystème Bigdata 1",                    "filiere_id": str(iir_id), "annee_id": str(annee4_id), "semestre": 2, "created_at": datetime.datetime.utcnow()},
]
db["matieres"].insert_many(matieres)
print(f"✅ {len(matieres)} matières insérées")

# ── 7. Comptes utilisateurs ──

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# ── Admin (collection séparée) ──
db["admin"].delete_many({})
db["admin"].insert_one({
    "nom": "Admin",
    "prenom": "DeepStudy",
    "email": "admin@deepstudy.ma",
    "password_hash": hash_password("admin1234"),
    "role": "admin",
    "created_at": datetime.datetime.utcnow()
})
print("✅ Compte admin inséré     → admin@deepstudy.ma / admin1234")

# ── Professeurs ──
db["professeurs"].delete_many({})
db["professeurs"].insert_many([
    {
        "nom": "Alami",
        "prenom": "Mohamed",
        "email": "alami@emsi.ma",
        "password_hash": hash_password("prof1234"),
        "role": "professeur",
        "created_at": datetime.datetime.utcnow()
    },
    {
        "nom": "Benali",
        "prenom": "Sara",
        "email": "benali@emsi.ma",
        "password_hash": hash_password("prof1234"),
        "role": "professeur",
        "created_at": datetime.datetime.utcnow()
    },
    {
        "nom": "Chraibi",
        "prenom": "Youssef",
        "email": "chraibi@emsi.ma",
        "password_hash": hash_password("prof1234"),
        "role": "professeur",
        "created_at": datetime.datetime.utcnow()
    },
])
print("✅ Comptes professeurs insérés → mot de passe : prof1234")

# ── Étudiants ──
db["etudiants"].delete_many({})
db["etudiants"].insert_many([
    {
        "nom": "Jeait",
        "prenom": "Amine",
        "email": "amine@emsi.ma",
        "password_hash": hash_password("etudiant1234"),
        "role": "etudiant",
        "filiere_id": str(iir_id),
        "annee_id": str(annee4_id),
        "specialite_id": str(specialite_id1),  # DDSI
        "created_at": datetime.datetime.utcnow()
    },
    {
        "nom": "Gourari",
        "prenom": "Mohamed Amine",
        "email": "gourari@emsi.ma",
        "password_hash": hash_password("etudiant1234"),
        "role": "etudiant",
        "filiere_id": str(iir_id),
        "annee_id": str(annee4_id),
        "specialite_id": str(specialite_id2),  # IASD
        "created_at": datetime.datetime.utcnow()
    },
])
print("✅ Comptes étudiants insérés   → mot de passe : etudiant1234")

# ── Résumé final ──
print("\n🎉 Données de test prêtes !")
print(f"\n📌 IIR ID        : {iir_id}")
print(f"📌 3ème année ID : {annee3_id}")
print(f"📌 4ème année ID : {annee4_id}")
print(f"📌 DDSI ID       : {specialite_id1}")
print(f"📌 IASD ID       : {specialite_id2}")
print(f"📌 CIR ID        : {specialite_id3}")
print("\n─────────────────────────────────────────")
print("👤 Comptes disponibles :")
print("─────────────────────────────────────────")
print("  ADMIN      → admin@deepstudy.ma   / admin1234")
print("  PROF 1     → alami@emsi.ma        / prof1234")
print("  PROF 2     → benali@emsi.ma       / prof1234")
print("  PROF 3     → chraibi@emsi.ma      / prof1234")
print("  ETUDIANT 1 → amine@emsi.ma        / etudiant1234  (DDSI)")
print("  ETUDIANT 2 → gourari@emsi.ma      / etudiant1234  (IASD)")
print("─────────────────────────────────────────")