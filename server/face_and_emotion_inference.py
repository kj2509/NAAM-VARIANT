import os
import sys
import cv2
import numpy as np
import dlib
from imutils import face_utils
from keras.models import load_model
import face_recognition
from statistics import mode
from face_and_emotion.utils.datasets import get_labels
from face_and_emotion.utils.inference import detect_faces
from face_and_emotion.utils.inference import draw_text
from face_and_emotion.utils.inference import draw_bounding_box
from face_and_emotion.utils.inference import apply_offsets
from face_and_emotion.utils.inference import load_detection_model
from face_and_emotion.utils.preprocessor import preprocess_input

USE_WEBCAM = True # If false, loads video file source

# parameters for loading data and images
emotion_model_path = './face_and_emotion/models/emotion_model.hdf5'
emotion_labels = get_labels('fer2013')

# hyper-parameters for bounding boxes shape
frame_window = 10
emotion_offsets = (20, 40)


# loading models
detector = dlib.get_frontal_face_detector()
emotion_classifier = load_model(emotion_model_path)

# getting input model shapes for inference
emotion_target_size = emotion_classifier.input_shape[1:3]

# starting lists for calculating modes
emotion_window = []

# image dir path
image_dir = "./face_and_emotion/images"
images = []
known_face_names = []
myList = os.listdir(image_dir)

# create list of face
for cl in myList:
    curImg = cv2.imread(f'{image_dir}/{cl}')
    images.append(curImg)
    known_face_names.append(os.path.splitext(cl)[0])
# Create arrays of known face encodings and their names

def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList

known_face_encodings = findEncodings(images)


# Initialize some variables
face_locations = []
face_encodings = []
face_names = []
process_this_frame = True


def face_compare(frame,process_this_frame):
    print ("compare")
    # Resize frame of video to 1/4 size for faster face recognition processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.50, fy=0.50)

    # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
    rgb_small_frame = small_frame[:, :, ::-1]

    # Only process every other frame of video to save time
    if True:
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"

            # If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = known_face_names[first_match_index]

            face_names.append(name)

    return face_names
# starting video streaming


def detect_face_and_emotion(frame):

    gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    faces = detector(rgb_image)
    face_name = face_compare(rgb_image,process_this_frame)
    print(faces)
    print(face_name)

    try:
        face_coordinates = faces[0]
        fname = face_name[0]
    except IndexError as err:
        print(f"INDEX ERROR={err}")
        return "Unknown", "neutral"

    x1, x2, y1, y2 = apply_offsets(face_utils.rect_to_bb(face_coordinates), emotion_offsets)
    gray_face = gray_image[y1:y2, x1:x2]
    try:
        gray_face = cv2.resize(gray_face, (emotion_target_size))
    except:
        print("GREY SCALE ERROR")
        return fname, "neutral"


    gray_face = preprocess_input(gray_face, True)
    gray_face = np.expand_dims(gray_face, 0)
    gray_face = np.expand_dims(gray_face, -1)
    emotion_prediction = emotion_classifier.predict(gray_face)
    emotion_probability = np.max(emotion_prediction)
    emotion_label_arg = np.argmax(emotion_prediction)
    emotion_text = emotion_labels[emotion_label_arg]

    return fname, emotion_text

