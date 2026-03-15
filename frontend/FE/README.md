# DeepStudy EMSI — Frontend

## 🚀 Démarrer le projet

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
Le fichier `.env` est déjà prêt avec :
```
VITE_API_URL=http://localhost:5000
```
Assure-toi que le backend Flask tourne sur le port 5000.

### 3. Lancer le serveur de développement
```bash
npm run dev
```
→ Ouvre http://localhost:3000

---

## 📁 Structure du projet

```
src/
├── api/              ← Appels HTTP vers le backend Flask
│   ├── axiosInstance.js   (intercepteur JWT automatique)
│   ├── authAPI.js
│   ├── documentsAPI.js
│   └── chatAPI.js
├── context/          ← État global (AuthContext)
├── hooks/            ← Hooks personnalisés
├── components/       ← Composants réutilisables
│   ├── layout/       (Navbar, Sidebar, ProtectedRoute)
│   ├── ui/           (Button, Input, Modal...)
│   └── documents/    (DocumentCard, UploadForm...)
├── pages/            ← Pages complètes
│   ├── public/       (Home, Login, Register)
│   ├── student/      (Dashboard, Library, Chat, History)
│   ├── professor/    (Dashboard, ManageDocuments)
│   └── admin/        (Dashboard)
├── utils/
│   ├── tokenUtils.js    (save/get/decode JWT)
│   └── formatters.js    (dates, tailles, badges)
└── styles/
    └── index.css         (Tailwind + variables CSS DeepStudy)
```

## 🔐 Gestion du JWT — Comment ça marche

1. L'utilisateur se connecte → le backend retourne un `token`
2. On sauvegarde ce token dans `localStorage` via `tokenUtils.js`
3. **Automatiquement**, `axiosInstance.js` ajoute `Authorization: Bearer <token>` à CHAQUE requête
4. Si le token expire → le backend répond `401` → l'intercepteur déconnecte l'utilisateur

Tu n'as jamais besoin de toucher au token manuellement dans tes composants.

## 🎨 Design System

Palette : Bleu nuit (`#0a0f1e`) + Bleu primaire (`#3478f6`) + Émeraude accent (`#15b07a`)

Classes utilitaires disponibles :
- `.ds-card` — Carte avec fond sombre
- `.ds-btn-primary` — Bouton bleu principal
- `.ds-btn-outline` — Bouton outline
- `.ds-btn-danger` — Bouton de suppression
- `.ds-input` — Champ de formulaire
- `.ds-label` — Label de formulaire
- `.ds-title` — Titre avec font Sora
- `.ds-muted` — Texte secondaire
- `.ds-badge` — Badge générique
- `.bg-grid` — Fond avec grille subtile
