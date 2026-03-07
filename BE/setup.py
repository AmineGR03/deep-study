import subprocess
import sys
import os
from dotenv import load_dotenv

def run(cmd):
    print(f"\n▶ {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    print("=" * 50)
    print("   DeepStudy EMSI — Setup automatique")
    print("=" * 50)

    # 1. Installer les dépendances
    print("\n📦 Installation des dépendances...")
    run(f"{sys.executable} -m pip install -r requirements.txt")

    # 2. Créer les dossiers manquants
    print("\n📁 Création des dossiers...")
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("chroma_db", exist_ok=True)
    print("✅ uploads/ et chroma_db/ créés")

    # 3. Vérifier le .env
    if not os.path.exists(".env"):
        print("\n⚙️  Création du fichier .env...")
        with open(".env", "w") as f:
            f.write("MONGO_URI=mongodb://localhost:27017/deepstudy\n")
            f.write("JWT_SECRET_KEY=deepstudy_secret_super_long_2026\n")
            f.write("UPLOAD_FOLDER=./uploads\n")
            f.write("CHROMA_PATH=./chroma_db\n")
        print("✅ .env créé")
    else:
        print("\n✅ .env déjà existant")

    # 4. Initialiser la base de données
    print("\n🗄️  Initialisation de la base de données MongoDB...")
    run(f"{sys.executable} app/db/init_db.py")

    print("\n" + "=" * 50)
    print("🎉 Setup terminé ! Lance le serveur avec :")
    print("   python run.py")
    print("=" * 50)

if __name__ == "__main__":
    main()