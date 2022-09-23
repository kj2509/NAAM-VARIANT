import os
import torch
import flask
import time
from flask import Flask
from flask import request
import torch.nn as nn
import cv2
import numpy as np
import io
from io import StringIO
from flask_socketio import send, emit
import base64
from PIL import Image
import imutils
import pickle

from face_and_emotion_inference import detect_face_and_emotion
from flask_login import current_user
from settings import app, socketio, login_manager, db
from db_models import User, Statistics, Session
from api import api


app.register_blueprint(api)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


DROWSY_MODEL = None
EMOTION_MODEL = None
DEVICE = torch.device("cpu")
PREDICTION_DICT = dict()


def drowsy_detection(input_img):
    """
    run the model on input_img and return the output
    """
    DROWSY_MODEL.to(DEVICE)
    DROWSY_MODEL.eval()
    results = DROWSY_MODEL(input_img)
    try:
        out = results.names[int(results.pred[0][0].tolist()[-1])]
    except IndexError:
        out = "awake"
    print(f"DROWSY_DETECTED={out}")
    return out


def shutdown_server():
    func = request.environ.get("werkzeug.server.shutdown")
    if func is None:
        raise RuntimeError("Not running with the Werkzeug Server")
    func()


@app.get("/shutdown")
def shutdown():
    shutdown_server()
    return "Server shutting down..."


@socketio.on("connect")
def test_connect(auth):
    print("Connected", flush=True)


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected", flush=True)


@socketio.on("image")
def image(data):
    print("DATA KEYSSSSSSSSSSSSSSSSSSSSSSS", data.keys())
    data_image = data.get("image")
    user_id = data.get("user_id")
    print("USER IDDDDDDDDDDDDDDDDDDD", user_id)
    print("drowsy detection", flush=True)
    sbuf = StringIO()
    sbuf.write(data_image)
    print("user_id", user_id)

    # decode and convert into image
    b = io.BytesIO(base64.b64decode(data_image))
    pimg = Image.open(b)

    # converting RGB to BGR, as opencv standards
    frame = cv2.cvtColor(np.array(pimg), cv2.COLOR_RGB2BGR)

    # Process the image frame
    frame = imutils.resize(frame, width=640)
    frame = cv2.flip(frame, 1)
    drowsy = drowsy_detection(frame)

    # decode and convert into image
    b = io.BytesIO(base64.b64decode(data_image))
    pimg = Image.open(b).convert("RGB")

    frame = np.array(pimg)
    frame = frame[:, :, ::-1]

    # Process the image frame
    frame = imutils.resize(frame, width=640)
    frame = cv2.flip(frame, 1)
    face, emotion = detect_face_and_emotion(frame)
    # emotion = None
    # face = None

    print(f"DROWSY_DETECTED={drowsy}")
    print(f"EMOTION={emotion}")
    print(f"FACE={face}")

    output_json = {"drowsy": drowsy, "emotion": emotion, "face": face}

    # Expecting user can only join in one session
    user_stats = Statistics.query.filter(
        Statistics.user_id == user_id, Statistics.is_closed == False
    ).first()

    if user_stats:
        user_stats.update_statistics_count(emotion, drowsy, face)
        db.session.commit()
    else:
        app.logger.warning("## NO ACTIVE STATS FOUND FOR USER")

    return output_json


if __name__ == "__main__":
    DROWSY_MODEL = torch.hub.load(
        "ultralytics/yolov5",
        "custom",
        path="./deployed-model/drowsy-det-model.pt",
        force_reload=True,
    )

    # app.run(host="0.0.0.0", port="5000")
    socketio.run(app, host="0.0.0.0", debug=True, allow_unsafe_werkzeug=True)
