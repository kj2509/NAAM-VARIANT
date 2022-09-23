"""Flask server configurations."""

import os


from flask import Flask
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
IMAGE_ROOT_DIR = os.path.join(
    BASE_DIR, "face_and_emotion", "images")  # required path


app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = os.urandom(32)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://kevin:Kevin2022@naam-postgresql.c7aj3x3hgrl7.ap-south-1.rds.amazonaws.com:5432/kevindb"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_POOL_SIZE"] = 20
app.config["SQLALCHEMY_MAX_OVERFLOW"] = 5
app.config["SQLALCHEMY_ECHO"] = True

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])
