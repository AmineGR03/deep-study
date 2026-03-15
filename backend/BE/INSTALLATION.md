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
cd NOM_DU_REPO/BE
```

### 2. Créer et activer le venv

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

> ✅ Tu dois voir `(venv)` au début de ta ligne de commande.

### 3. Installer les dépendances

```bash
python -m pip install -r requirements.txt
```

> ⚠️ La première installation peut prendre quelques minutes — le modèle `all-MiniLM-L6-v2` (~90MB) se télécharge automatiquement.

### 4. Créer le fichier `.env`

Crée un fichier `.env` à la racine de `BE/` :

```env
MONGO_URI=mongodb://localhost:27017/deepstudy
JWT_SECRET_KEY=deepstudy_secret_super_long_2026
UPLOAD_FOLDER=./uploads
CHROMA_PATH=./chroma_db
```

> ⚠️ Ne jamais committer ce fichier — il est déjà dans le `.gitignore`.

### 5. Créer les dossiers manquants

```bash
mkdir uploads
mkdir chroma_db
```

### 6. Lancer MongoDB (dans un terminal séparé)

```bash
# Windows
mongod

# Mac / Linux
sudo systemctl start mongod
```

> Laisse ce terminal ouvert et reviens dans le terminal principal.

### 7. Initialiser les collections

```bash
python app/db/init_db.py
```

### 8. Insérer les données de test

```bash
python app/db/seed_data.py
```

Tu verras à la fin le résumé des comptes disponibles :

```
👤 Comptes disponibles :
  ADMIN      → admin@deepstudy.ma   / admin1234
  PROF 1     → alami@emsi.ma        / prof1234
  PROF 2     → benali@emsi.ma       / prof1234
  PROF 3     → chraibi@emsi.ma      / prof1234
  ETUDIANT 1 → amine@emsi.ma        / etudiant1234
  ETUDIANT 2 → gourari@emsi.ma      / etudiant1234
  
```

### 9. Lancer le serveur

```bash
python run.py
```

✅ Le serveur tourne sur `http://127.0.0.1:5000`

---


### Configurer ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Télécharge et lance l'installateur depuis : https://ollama.com/download

ollama pull qwen2.5:0.5b
ollama serve



## 🧪 Tester que tout fonctionne

### Se connecter avec un compte seedé

```
POST http://127.0.0.1:5000/auth/login
Content-Type: application/json

{
  "email": "alami@emsi.ma",
  "password": "prof1234"
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

### Vider et réinitialiser la base de données

```bash
python app/db/clear_db.py    # Vider toutes les collections
python app/db/init_db.py     # Recréer les collections + index
python app/db/seed_data.py   # Réinsérer les données de test
```

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
BE/
├── app/
│   ├── __init__.py             # Factory Flask + connexion MongoDB
│   ├── config.py               # Variables d'environnement
│   ├── routes/
│   │   ├── auth.py             # /auth/login, /auth/register
│   │   ├── documents.py        # /documents/upload, /list, DELETE
│   │   └── chat.py             # /chat/ask, /chat/history
│   ├── middleware/
│   │   └── auth_middleware.py  # Décorateur role_required
│   ├── services/
│   │   └── rag_service.py      # Pipeline RAG complet
│   └── db/
│       ├── init_db.py          # Création collections + index
│       ├── seed_data.py        # Insertion données de test
│       └── clear_db.py         # Vidage de la BD
├── uploads/                    # Fichiers PDF stockés ici
├── chroma_db/                  # Vecteurs ChromaDB stockés ici
├── clear_uploads.py            # Vider le dossier uploads
├── setup.py                    # Script d'installation automatique
├── .env                        # Variables secrètes (ne pas committer)
├── requirements.txt            # Dépendances Python
└── run.py                      # Point d'entrée du serveur
```

---

## ❓ Problèmes fréquents

| Erreur | Solution |
|---|---|
| `ModuleNotFoundError` | Utiliser `python -m pip install -r requirements.txt` au lieu de `pip install` |
| `Connection refused` (MongoDB) | Lancer MongoDB : `mongod` |
| `Subject must be a string` | Token expiré ou ancien — refaire un `/auth/login` |
| `ImportError: cannot import ...` | Supprimer `__pycache__` et relancer |
| `422 Unprocessable Entity` | Vérifier que le Body est en `raw → JSON` dans Postman |
| `seed_data.py` échoue | MongoDB n'est pas lancé — lancer `mongod` d'abord |
| venv ne reconnaît pas pip | Utiliser `python -m pip` à la place de `pip` directement |