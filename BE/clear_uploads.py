import os
import shutil

UPLOAD_FOLDER = "./uploads"

def clear_uploads():
    if not os.path.exists(UPLOAD_FOLDER):
        print("Le dossier uploads n'existe pas.")
        return

    for item in os.listdir(UPLOAD_FOLDER):
        item_path = os.path.join(UPLOAD_FOLDER, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)

    print("✅ Dossier uploads vidé avec succès !")

if __name__ == "__main__":
    clear_uploads()