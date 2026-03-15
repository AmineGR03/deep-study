import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
    
    GROQ_API_KEY      = os.getenv("GROQ_API_KEY")  # ← ajouter
