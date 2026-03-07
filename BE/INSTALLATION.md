# DeepStudy EMSI — Guide d'installation

> Guide complet pour installer et lancer le backend sur une nouvelle machine.

---

## 📋 Prérequis

Assure-toi d'avoir installé sur ta machine :

| Outil | Version recommandée | Lien |
|---|---|---|
| Python | 3.10+ | https://www.python.org/downloads |
| MongoDB | 7.0+ | https://www.mongodb.com/try/download/community |
| Git | Dernière version | https://git-scm.com |
| Postman | Dernière version | https://www.postman.com/downloads (optionnel, pour tester) |

---

## 🚀 Étapes d'installation

### 1. Cloner le repo

```bash
git clone https://github.com/TON_USERNAME/NOM_DU_REPO.git
cd NOM_DU_REPO
```

### 2. Se mettre sur la bonne branche

```bash
git checkout feature/backend
```

### 3. Créer l'environnement virtuel Python

```bash
# Créer le venv
python -m venv venv

# Activer sur Windows
venv\Scripts\activate

# Activer sur Mac / Linux
source venv/bin/activate
```

> ✅ Tu dois voir `(venv)` au début de ta ligne de commande.

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

> ⚠️ La première installation peut prendre quelques minutes — le modèle `all-MiniLM-L6-v2` (~90MB) se télécharge automatiquement.

### 5. Configurer les variables d'environnement

Crée un fichier `.env` à la racine du projet :

```env
MONGO_URI=mongodb://localhost:27017/deepstudy
JWT_SECRET_KEY=deepstudy_secret_super_long_2026
UPLOAD_FOLDER=./uploads
CHROMA_PATH=./chroma_db
```

> ⚠️ Ne jamais committer ce fichier — il est déjà dans le `.gitignore`.

### 6. Lancer MongoDB

Assure-toi que MongoDB tourne en local :

```bash
# Windows (si installé comme service, il tourne déjà)
# Sinon, lance manuellement :
mongod

# Mac / Linux
sudo systemctl start mongod
```

### 7. Initialiser la base de données

Ce script crée toutes les collections et les index :

```bash
python app/db/init_db.py
```

Tu dois voir :
```
✅ Collection créée : filieres
✅ Collection créée : specialites
...
✅ Type inséré : COURS
✅ Type inséré : TP
✅ Type inséré : EXAM
✅ Type inséré : RESUME
🎉 Base de données initialisée avec succès !
```

> ⚠️ Ne lancer ce script qu'une seule fois. Si tu le relances, il affichera "Déjà existante" pour chaque collection — c'est normal.

### 8. Lancer le serveur

```bash
python run.py
```

Tu dois voir :
```
* Running on http://127.0.0.1:5000
* Debugger is active!
```

---

## 🧪 Tester que tout fonctionne

### Créer un compte étudiant

```
POST http://127.0.0.1:5000/auth/register
Content-Type: application/json

{
  "nom": "Jeait",
  "prenom": "Amine",
  "email": "amine@emsi.ma",
  "password": "1234",
  "role": "etudiant"
}
```

### Créer un compte professeur

```
POST http://127.0.0.1:5000/auth/register
Content-Type: application/json

{
  "nom": "Alami",
  "prenom": "Mohamed",
  "email": "prof@emsi.ma",
  "password": "1234",
  "role": "professeur"
}
```

### Se connecter et récupérer le token

```
POST http://127.0.0.1:5000/auth/login
Content-Type: application/json

{
  "email": "prof@emsi.ma",
  "password": "1234"
}
```

Réponse attendue :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "professeur"
}
```

### Uploader un PDF (avec le token prof)

```
POST http://127.0.0.1:5000/documents/upload
Authorization: Bearer TON_TOKEN
Body: form-data

  file       → ton_fichier.pdf
  titre      → Cours Réseaux
  filiere_id → IIR
  annee_id   → 4
  type       → COURS
```

### Poser une question (avec le token étudiant)

```
POST http://127.0.0.1:5000/chat/ask
Authorization: Bearer TOKEN_ETUDIANT
Content-Type: application/json

{
  "question": "De quoi parle ce document ?",
  "filiere_id": "IIR"
}
```

---

## 🛠️ Utilitaires

### Vider le dossier uploads

```bash
python clear_uploads.py
```

### Supprimer le cache Python (en cas d'erreur d'import)

```bash
# Windows
Remove-Item -Recurse -Force app\__pycache__
Remove-Item -Recurse -Force app\routes\__pycache__

# Mac / Linux
find . -type d -name __pycache__ -exec rm -rf {} +
```

---

## 📁 Structure du projet

```
deepstudy-backend/
├── app/
│   ├── __init__.py          # Factory Flask + connexion MongoDB
│   ├── config.py            # Variables d'environnement
│   ├── routes/
│   │   ├── auth.py          # /auth/login, /auth/register
│   │   ├── documents.py     # /documents/upload, /list, DELETE
│   │   └── chat.py          # /chat/ask, /chat/history
│   ├── middleware/
│   │   └── auth_middleware.py  # Décorateur role_required
│   ├── services/
│   │   └── rag_service.py      # Pipeline RAG complet
│   └── db/
│       └── init_db.py          # Initialisation MongoDB
├── uploads/                 # Fichiers PDF stockés ici
├── chroma_db/               # Vecteurs ChromaDB stockés ici
├── clear_uploads.py         # Script utilitaire
├── .env                     # Variables secrètes (ne pas committer)
├── requirements.txt         # Dépendances Python
└── run.py                   # Point d'entrée du serveur
```

---

## ❓ Problèmes fréquents

| Erreur | Solution |
|---|---|
| `ModuleNotFoundError` | Vérifier que le venv est activé : `venv\Scripts\activate` |
| `Connection refused` (MongoDB) | Lancer MongoDB : `mongod` |
| `Subject must be a string` | Token expiré ou ancien — refaire un `/auth/login` |
| `ImportError: cannot import ...` | Supprimer `__pycache__` et relancer |
| `422 Unprocessable Entity` | Vérifier que le Body est en `raw → JSON` dans Postman |
