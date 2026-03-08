# DeepStudy EMSI — Backend
## Journal de développement & Suivi du projet

---

## 📋 Informations générales

| Champ | Détail |
|---|---|
| Projet | DeepStudy EMSI — Assistant Intelligent de Gestion et d'Accès aux Ressources Pédagogiques |
| Équipe | EMSI Gen-AI |
| Compétition | Ramadan AI Competition 2026 — AI Nexus, EMSI Rabat |
| Responsable Backend | Amine Jeait / Mohamed Amine Gourari |
| Stack | Python Flask + MongoDB + ChromaDB + LangChain |

---

## 🚀 Installation

### 1. Cloner le repo et aller dans BE/

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

### 3. Lancer le setup automatique

```bash
python setup.py
```

> Ce script installe les dépendances, crée les dossiers `uploads/` et `chroma_db/`, génère le `.env` et initialise la base de données MongoDB automatiquement.

### 4. Lancer MongoDB (dans un terminal séparé)

```bash
mongod
```

### 5. Lancer le serveur

```bash
python run.py
```

✅ Le serveur tourne sur `http://127.0.0.1:5000`

---

## 📅 07 Mars 2026 — Session 1 : Initialisation & Auth

### ✅ Ce qui a été fait

#### 1. Mise en place du repo Git
- Clonage du repo GitHub vide sur la machine locale
- Création de la branche de travail `feature/backend` (isolation du `main`)
- Premier commit avec la structure vide du projet
- Push sur `origin feature/backend`

#### 2. Structure du projet créée
```
deepstudy-backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── documents.py
│   │   └── chat.py
│   ├── middleware/
│   │   └── auth_middleware.py
│   ├── services/
│   │   └── rag_service.py
│   └── db/
│       ├── init_db.py
│       ├── seed_data.py
│       └── clear_db.py
├── uploads/
├── chroma_db/
├── .env
├── requirements.txt
├── setup.py
├── clear_uploads.py
├── run.py
└── .gitignore
```

#### 3. Dépendances installées
```
flask, flask-jwt-extended, pymongo, bcrypt,
python-dotenv, langchain, langchain-community,
chromadb, pypdf, python-docx, sentence-transformers
```

#### 4. Base de données MongoDB initialisée
Script `app/db/init_db.py` exécuté — toutes les collections créées :
- `filieres`, `specialites`, `annees`, `semestres`
- `etudiants`, `professeurs` (contient aussi les admins via le champ `role`)
- `matieres`, `types_ressources`, `ressources`, `document_chunks`
- `conversations`, `messages`

> ⚠️ Les admins sont stockés dans la collection `professeurs` avec `role: "admin"` — pas de collection séparée.

Types de ressources seedés : `COURS`, `TP`, `EXAM`, `RESUME`

Index créés sur : `email` (unique), `filiere_id`, `matiere_id`, `annee_id`, `conversation_id`, `etudiant_id`

#### 5. Authentification JWT ✅
- `POST /auth/register` — création de compte avec rôle (etudiant / professeur / admin)
- `POST /auth/login` — connexion + retour du token JWT
- Middleware `role_required(*roles)` — protection des routes par rôle
- Mots de passe hashés avec `bcrypt`
- Token JWT avec `additional_claims` (role, email) pour compatibilité Flask-JWT-Extended récent

**Fix appliqué :** `identity` du JWT doit être une `string` (l'`_id` MongoDB) — le `role` et l'`email` passent en `additional_claims`.

#### 6. Upload PDF + Pipeline RAG ✅
- `POST /documents/upload` — upload d'un fichier PDF, indexation automatique dans ChromaDB
- `GET /documents/list` — liste filtrée par filiere_id / matiere_id / annee_id / type
- `DELETE /documents/:id` — suppression fichier + purge des vecteurs ChromaDB

**Pipeline RAG implémenté (`rag_service.py`) :**
1. Extraction du texte page par page (PyPDF)
2. Découpage en chunks de ~500 caractères
3. Vectorisation avec `sentence-transformers` (modèle `all-MiniLM-L6-v2`)
4. Indexation dans ChromaDB avec métadonnées (filiere_id, matiere_id, page...)

**Test réussi :** Upload d'un PDF → **35 chunks indexés** ✅

#### 7. Chatbot RAG ✅
- `POST /chat/ask` — question → recherche vectorielle Top-5 → génération réponse citée
- `GET /chat/history` — historique des conversations d'un étudiant
- Conversations et messages sauvegardés dans MongoDB

#### 8. Seeders & Utilitaires ✅

**`app/db/seed_data.py`** — Insère toutes les données de test :
- 6 filières (IIR, GESI, IAII, GCBTP, GI, GF)
- 5 années + 10 semestres
- 3 spécialités IIR (DDSI, IASD, CIR)
- 4 types de ressources (COURS, TP, EXAM, RESUME)
- 44 matières (3ème et 4ème année IIR — S1 et S2)
- Comptes utilisateurs prêts à l'emploi :

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@deepstudy.ma | admin1234 |
| Professeur | alami@emsi.ma | prof1234 |
| Professeur | benali@emsi.ma | prof1234 |
| Professeur | chraibi@emsi.ma | prof1234 |
| Étudiant | amine@emsi.ma | etudiant1234 |
| Étudiant | gourari@emsi.ma | etudiant1234 |


**`app/db/clear_db.py`** — Vide toutes les collections MongoDB avec confirmation :
```bash
python app/db/clear_db.py
# ⚠️ Es-tu sûr de vouloir vider toute la BD ? (oui/non) :
```

**`clear_uploads.py`** — Vide le dossier `uploads/` et les fichiers physiques.

**`setup.py`** — Installation et configuration automatique du projet.

**Workflow base de données :**
```bash
python app/db/clear_db.py    # 1. Vider la BD
python app/db/init_db.py     # 2. Recréer les collections + index
python app/db/seed_data.py   # 3. Insérer les données de test
```

---

## 🔧 Problèmes rencontrés & Solutions

| Problème | Cause | Solution |
|---|---|---|
| `ImportError: cannot import auth_bp` | Fichiers routes vides | Remplir les fichiers + supprimer `__pycache__` |
| `KeyError: 'email'` | Données envoyées en query params au lieu de JSON body | Utiliser Body → raw → JSON dans Postman |
| `Subject must be a string` | Flask-JWT-Extended récent exige une string comme identity | Passer l'`_id` comme identity, role/email en `additional_claims` |
| Erreur 422 avec ancien token | Token généré avant le fix du JWT | Re-login pour obtenir un nouveau token |
| `ModuleNotFoundError: pymongo` | pip installe dans le Python global, pas dans le venv | Supprimer et recréer le venv, utiliser `python -m pip install` |

---

## 📊 État d'avancement

| Phase | Statut |
|---|---|
| Structure projet + Config | ✅ Terminé |
| Authentification JWT | ✅ Terminé |
| MongoDB — Collections + Index | ✅ Terminé |
| Upload PDF + RAG Indexation | ✅ Terminé |
| Chatbot /chat/ask | ✅ Terminé |
| Historique conversations | ✅ Terminé |
| Tests Postman | ✅ Validés |
| Script setup.py | ✅ Terminé |
| Seeders (filières, matières, users) | ✅ Terminé |
| Script clear_db.py | ✅ Terminé |
| Connexion avec le Frontend | ⏳ À faire |
| Intégration LLM (Ollama/OpenAI) | ⏳ À faire |
| Déploiement | ⏳ À faire |

---

## 🚀 Prochaines étapes

- [ ] Tester `/chat/ask` avec un vrai LLM (Ollama + Mistral)
- [ ] Aligner les contrats d'API avec le Frontend 
- [ ] Ajouter la gestion des erreurs globale (error handlers Flask)
- [ ] Écrire les tests unitaires pour les routes principales
- [ ] Déploiement sur serveur (Railway / Render / VPS)