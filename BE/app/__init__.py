from flask import Flask
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from .config import Config

db = None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    JWTManager(app)

    global db
    client = MongoClient(app.config["MONGO_URI"])
    db = client.get_default_database()

    from .routes.auth import auth_bp
    from .routes.documents import documents_bp
    from .routes.chat import chat_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(documents_bp, url_prefix="/documents")
    app.register_blueprint(chat_bp, url_prefix="/chat")

    return app