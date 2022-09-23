import os
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

# Load a sample picture and learn how to recognize it.
image_dir = "./face_and_emotion/images"

obama_image = face_recognition.load_image_file(os.path.join(image_dir, "Obama.jpg"))
obama_face_encoding = face_recognition.face_encodings(obama_image)[0]

# Load a second sample picture and learn how to recognize it.
trump_image = face_recognition.load_image_file(os.path.join(image_dir, "Trump.jpg"))
trump_face_encoding = face_recognition.face_encodings(trump_image)[0]

aravind_image = face_recognition.load_image_file(os.path.join(image_dir, "aravind.jpg"))
aravind_face_encoding = face_recognition.face_encodings(aravind_image)[0]

# Create arrays of known face encodings and their names
known_face_encodings = [
    obama_face_encoding,
    trump_face_encoding,
    aravind_face_encoding,
]
known_face_names = [
    "Barack Obama",
    "Trump",
    "Aravind",
]

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
    if process_this_frame:
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

    process_this_frame = not process_this_frame

    return face_names


def face_and_emotion_inference(frame):

    gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    faces = detector(rgb_image)
    face_name = face_compare(rgb_image,process_this_frame)
    for face_coordinates, fname in zip(faces,face_name):
        print ("forrrrr")
        x1, x2, y1, y2 = apply_offsets(face_utils.rect_to_bb(face_coordinates), emotion_offsets)
        gray_face = gray_image[y1:y2, x1:x2]
        try:
            gray_face = cv2.resize(gray_face, (emotion_target_size))
        except:
            continue


        gray_face = preprocess_input(gray_face, True)
        gray_face = np.expand_dims(gray_face, 0)
        gray_face = np.expand_dims(gray_face, -1)
        emotion_prediction = emotion_classifier.predict(gray_face)
        emotion_probability = np.max(emotion_prediction)
        emotion_label_arg = np.argmax(emotion_prediction)
        emotion_text = emotion_labels[emotion_label_arg]
        emotion_window.append(emotion_text)

        if len(emotion_window) > frame_window:
            emotion_window.pop(0)
        try:
            emotion_mode = mode(emotion_window)
        except:
            continue

        if emotion_text == 'angry':
            color = emotion_probability * np.asarray((255, 0, 0))
        elif emotion_text == 'sad':
            color = emotion_probability * np.asarray((0, 0, 255))
        elif emotion_text == 'happy':
            color = emotion_probability * np.asarray((255, 255, 0))
        elif emotion_text == 'surprise':
            color = emotion_probability * np.asarray((0, 255, 255))
        else:
            color = emotion_probability * np.asarray((0, 255, 0))

        color = color.astype(int)
        color = color.tolist()

        if fname == "Unknown":
            name = emotion_text
        else:
            name = str(fname) + " is " + str(emotion_text)
        
        draw_bounding_box(face_utils.rect_to_bb(face_coordinates), rgb_image, color)
        draw_text(face_utils.rect_to_bb(face_coordinates), rgb_image, name,
                  color, 0, -45, 0.5, 1)


    frame = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)

    return frame


