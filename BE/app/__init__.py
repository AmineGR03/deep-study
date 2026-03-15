from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from flask_cors import CORS
from .config import Config
import os

db = None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    JWTManager(app)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    global db
    client = MongoClient(app.config["MONGO_URI"])
    db = client.get_default_database()

    from .routes.auth      import auth_bp
    from .routes.documents import documents_bp
    from .routes.chat      import chat_bp
    from .routes.data      import data_bp
    from .routes.admin     import admin_bp

    app.register_blueprint(auth_bp,      url_prefix="/auth")
    app.register_blueprint(documents_bp, url_prefix="/documents")
    app.register_blueprint(chat_bp,      url_prefix="/chat")
    app.register_blueprint(data_bp,      url_prefix="/data")
    app.register_blueprint(admin_bp,     url_prefix="/admin")

    # Servir les fichiers uploadés
    @app.route('/uploads/<path:filename>')
    def serve_file(filename):
        upload_folder = os.path.join(os.getcwd(), 'uploads')
        return send_from_directory(upload_folder, filename)

    return app