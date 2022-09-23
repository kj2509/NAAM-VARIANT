"""
All api routes 

"""
import datetime
import math
import os
import random
from io import BytesIO

from flask import Blueprint, jsonify, redirect, request, send_file, url_for
from flask_login import current_user, login_required, login_user, logout_user
from db_models import User, Statistics, Session, Image
from settings import app, db, IMAGE_ROOT_DIR

api = Blueprint(
    "api_views",
    __name__,
    template_folder="templates",
    static_folder="static",
    # url_prefix="/api",
)


def calc_aggregate_sentiment(
    drowsy: int,
    awaken: int,
    angry: int,
    disgust: int,
    fear: int,
    happy: int,
    sad: int,
    surprise: int,
    neutral: int,
    attendance: int,
    attendance_total: int,
    *args,
) -> dict:
    """Calculate overall sentiment percentage

    :return: Dictionary percentage values of drowsiness and emotion and attendance

    """

    # All extra fractions will be added into neutral/awaken
    # Total can also get from `attendance_total`
    total_count = drowsy + awaken  # total => sum either of drowsy, emotion
    if total_count <= 0:
        return {}
    drowsy_p = math.floor(drowsy / total_count * 100)
    awaken_p = 100 - drowsy_p
    angry_p = math.floor(angry / total_count * 100)
    disgust_p = math.floor(disgust / total_count * 100)
    fear_p = math.floor(fear / total_count * 100)
    happy_p = math.floor(happy / total_count * 100)
    sad_p = math.floor(sad / total_count * 100)
    surprise_p = math.floor(surprise / total_count * 100)
    neutral_p = 100 - angry_p - disgust_p - fear_p - happy_p - sad_p - surprise_p
    attendance_p = round(attendance / attendance_total * 100)

    return {
        "drowsiness": {
            "drowsy": drowsy_p,
            "awaken": awaken_p,
        },
        "emotions": {
            "angry": angry_p,
            "disgust": disgust_p,
            "fear": fear_p,
            "happy": happy_p,
            "sad": sad_p,
            "surprise": surprise_p,
            "neutral": neutral_p,
        },
        "attendance": attendance_p,
    }


@api.route("/register", methods=["POST"])
def register():
    """Api to register Student or Teacher

    Request Method: POST

    Form Data params:
      - first_name      : `str`
      - last_name       : `str`
      - email           : `str`
      - password        : `str`
      - is_teacher      : `bool`
      - profile_photo   : `image file` [mandatory for student profile]

    """

    if request.form:
        user_email = request.form.get("email", None)
        user_password = request.form.get("password", None)
        user_fname = request.form.get("first_name", None)
        user_lname = request.form.get("last_name", "")
        # FIXME: bool value from formdata is not recognized !!
        user_is_teacher = request.form.get("is_teacher", False)
    elif request.headers.get("Content-Type") == "application/json":
        user_email = request.json.get("email", None)
        user_password = request.json.get("password", None)
        user_fname = request.json.get("first_name", None)
        user_lname = request.json.get("last_name", "")
        user_is_teacher = request.json.get("is_teacher", False)
    else:
        return jsonify({"error": "Content-Type not supported!", "status": 400}), 400

    if not user_email or not user_password or not user_fname:
        return jsonify({"error": "Missing required data", "status": 400}), 400

    if User.query.filter_by(email=user_email).first() is not None:
        return jsonify({"error": "User already exists", "status": 400}), 400

    if not isinstance(user_is_teacher, bool):
        if user_is_teacher.lower() == "true":
            user_is_teacher = True
        else:
            user_is_teacher = False

    file = request.files.get("profile_photo")

    user = User(
        first_name=user_fname,
        last_name=user_lname,
        email=user_email,
        is_teacher=user_is_teacher,
    )
    if not user.is_teacher and file is None:
        return (
            jsonify(
                {"error": "Profile picture is mandatory for student.", "status": 400}
            ),
            400,
        )
    user.set_password(user_password)
    db.session.add(user)
    db.session.flush()  # update with db: for getting uid
    if file and user.id:  # mandatory for student
        image = Image(image_blob=file.read(), is_pfp=True, user_id=user.id)
        db.session.add(image)
    db.session.commit()  # commit changes permenently

    return jsonify(user.serialize), 201


@api.route("/login", methods=["POST"])
def login():
    """Log in user

    Request method: POST

    Auth - Basic Authorization
      - :username: - user email
      - :password: - user password

    """
    if request.json:
        email = request.json.get("email")
        password = request.json.get("password")
    else:
        response = jsonify(
            {"error": "No values in authorization", "status": 400}), 400
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    if email and password:
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)

            if not user.is_teacher:
                # Saves image locally on successfull login for User
                image_path = os.path.join(IMAGE_ROOT_DIR, user.pfp_filename)
                img_blob = user.profile_photo.image_blob

                if img_blob:
                    # if os.path.isfile(image_path): # replace if existing ??
                    try:
                        with open(image_path, "wb+") as f:
                            f.write(img_blob)
                    except Exception as e:
                        app.logger.error(
                            f"## Error occured while saving image locally:\n{e}"
                        )
            return jsonify(user.serialize), 202
        else:
            return jsonify({"error": "Invalid credentials", "status": 400}), 400

    return jsonify({"error": "Failed to login, No data in json!", "status": 400}), 400


@api.route("/logout")
def logout():
    """Logout the current user: removes the cookie stored"""
    # if current_user.is_authenticated:
    logout_user()
    return jsonify({"message": "Logged out", "status": 200}), 200


@api.route("/me")
@login_required
# Note: In-case cookie not working use below, also pass `current_user` in me(current_user)
# @User.auth_required
def me():
    """Return user profile"""

    if current_user:
        return jsonify(current_user.serialize_detail)
    else:
        return jsonify({"error": "Unautherized", "status": 401}), 401


@api.route("/students", methods=["GET"])
# @login_required
def list_students():
    """List all students"""

    # if current_user.is_teacher:
    data = []
    students = User.query.filter_by(is_teacher=False)
    for student in students:
        data.append(student.serialize_detail)
    return jsonify(data)
    # return jsonify({"error": "Permission denied!", "status": 403}), 403


@api.route("/profile_pic", methods=["GET"])
# @login_required
@User.auth_required
def profile_photo(current_user):
    """Redirect to profile photo url of the requested user"""
    return redirect(url_for("api_views.user_profile_photo", user_id=current_user.id))


@api.route("/profile_pic/<int:user_id>", methods=["GET"])
# @login_required
def user_profile_photo(user_id: int):
    """Send profile photo if requested user is current user or teacher"""

    # if user_id == current_user.id:
    #     user = current_user
    # else:
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "No user found", "status": 404}), 404

    img_blob = user.profile_photo.image_blob

    if img_blob:
        return send_file(BytesIO(img_blob), mimetype="image/jpeg")

    return jsonify({"error": "Profile photo not found!", "status": 404}), 404


# SESSIONS
@api.route("/session/create", methods=["POST"])
# @login_required
@User.auth_required
def teacher_create_session(current_user):
    """Create session by teacher"""

    if current_user.is_teacher:
        if any([s.is_active for s in current_user.sessions]):
            return (
                jsonify(
                    {"error": "An active session already exists!", "status": 403}),
                403,
            )

        start_dt = datetime.datetime.now()
        session = Session(user_id=current_user.id, start_datetime=start_dt)
        db.session.add(session)
        db.session.commit()

        return jsonify(session.serialize)
    return jsonify({"error": "Permission denied", "status": 403}), 403


@api.route("/session/end", methods=["POST"])
# @login_required
@User.auth_required
def teacher_end_session(current_user):
    """End current active session by teacher"""

    if current_user.is_teacher:
        end_dt = datetime.datetime.now()
        session = Session.query.filter_by(
            user_id=current_user.id, end_datetime=None
        ).first()
        if not session:
            return (
                jsonify(
                    {
                        "error": "No active sessions to close!",
                        "status": 404,
                        "user": {
                            "id": current_user.id,
                            "name": current_user.full_name,
                        },
                    }
                ),
                404,
            )
        session.end_datetime = end_dt
        # Close all child statistics
        db.session.query(Statistics).filter(Statistics.session_id == session.id).update(
            {Statistics.is_closed: True}, synchronize_session=False
        )
        db.session.commit()

        return jsonify({"message": "Session ended", "id": session.id, "status": 200})
    return jsonify({"error": "Permission denied", "status": 400}), 400


@api.route("/session/list", methods=["GET"])
# @login_required
def list_active_session():
    """List all active sessions"""
    active_sessions = Session.query.filter(
        Session.start_datetime != None, Session.end_datetime == None
    )
    data = []
    for session in active_sessions:
        data.append(session.serialize)

    return jsonify(data)


@api.route("/session/complete", methods=["GET"])
# @login_required
@User.auth_required
def list_all_session(current_user):
    """List all all sessions"""
    all_sessions = Session.query.filter(
        Session.start_datetime != None,
        Session.user_id == current_user.id
    )
    data = []
    for session in all_sessions:
        data.append(session.serialize_complete)

    return jsonify(data)


@api.route("/session", methods=["GET"])
@login_required
def current_session():
    """Re-direct to user's current active session"""

    active_session = None
    if current_user.is_teacher:
        active_session = Session.query.filter_by(
            user_id=current_user.id, end_datetime=None
        ).first()

    else:
        active_session = Session.query.filter(
            Session.end_datetime == None, Session.students.any(
                id=current_user.id)
        ).first()

    if not active_session:
        return jsonify({"error": "No active sessions"}), 404
    return redirect(url_for("api_views.get_session", session_id=active_session.id))


@api.route("/session/<int:session_id>", methods=["GET"])
# @login_required
@User.auth_required
def get_session(current_user, session_id: int):
    """
    Get Session details
    """

    session_obj = Session.query.get(session_id)
    if session_obj:
        if request.method == "GET":
            data = {
                "session": session_obj.serialize,
                "students_list": [],
                # "teacher": session_obj.teacher.serialize,
            }
            students = session_obj.students

            for student in students:
                if current_user.is_teacher:
                    data["students_list"].append(student.serialize_complete)
                else:
                    data["students_list"].append(student.serialize)
                    if student.id == current_user.id:
                        data["student"] = student.serialize_detail
            return jsonify(data)

    return {"error": "Session not found", "status": 404}, 404


@api.route("/session/<int:session_id>/join", methods=["POST"])
# @login_required
@User.auth_required
def student_join_session(current_user, session_id: int):
    """Student join session"""

    if not current_user.is_teacher:

        # Check if already joined in any other sessions
        joined_session = Session.query.filter(
            Session.end_datetime == None, Session.students.any(
                id=current_user.id)
        ).first()
        if joined_session:
            if joined_session.id == session_id:
                return {
                    "message": "Already joined in the session.",
                    "status": 201,
                }, 201
            return {
                "message": "Cannot join multiple sessions at a time",
                "status": 400,
            }, 400

        statistics_obj = Statistics(
            user_id=current_user.id, session_id=session_id)

        db.session.add(statistics_obj)
        db.session.commit()

        return jsonify(
            {
                "message": "Successfully joined!",
                "session_id": session_id,
                "status": 200,
            }
        )
    return (
        jsonify(
            {"error": "Only students are allowed to join a session", "status": 400}
        ),
        400,
    )


@api.route("/session/student/<int:student_id>", methods=["GET"])
# @login_required
@User.auth_required
def student_profile(current_user, student_id: int):
    """Student dashboard"""

    if current_user.is_teacher or (current_user.id == student_id):
        query_results = (
            db.session.query(
                User,
                db.func.sum(Statistics.drowsiness_count),
                db.func.sum(Statistics.awaken_count),
                db.func.sum(Statistics.angry_count),
                db.func.sum(Statistics.disgust_count),
                db.func.sum(Statistics.fear_count),
                db.func.sum(Statistics.happy_count),
                db.func.sum(Statistics.sad_count),
                db.func.sum(Statistics.surprise_count),
                db.func.sum(Statistics.neutral_count),
                db.func.sum(Statistics.attendance_present),
                db.func.sum(Statistics.attendance_total),
            )
            .select_from(User)
            .join(Statistics)
            .filter(User.id == student_id)
            .group_by(User.id)
        ).first()
        if query_results:
            data: dict = query_results[0].serialize_detail
            data["stats"] = calc_aggregate_sentiment(*query_results[1:])

            return jsonify(data)

        else:
            return (
                jsonify(
                    {"error": "No data found", "status": 404,
                        "student_id": student_id}
                ),
                404,
            )

    return jsonify({"error": "Permission denied", "status": 403}), 403


@api.route("/session/student/active-session", methods=["POST"])
@User.auth_required
def active_session_students_profile(current_user):
    """Aggregated results of all students"""
    if current_user.is_teacher:
        query_results = (
            db.session.query(
                User,
                db.func.sum(Statistics.drowsiness_count),
                db.func.sum(Statistics.awaken_count),
                db.func.sum(Statistics.angry_count),
                db.func.sum(Statistics.disgust_count),
                db.func.sum(Statistics.fear_count),
                db.func.sum(Statistics.happy_count),
                db.func.sum(Statistics.sad_count),
                db.func.sum(Statistics.surprise_count),
                db.func.sum(Statistics.neutral_count),
                db.func.sum(Statistics.attendance_present),
                db.func.sum(Statistics.attendance_total),
            )
            .select_from(User)
            .join(Statistics)
            .join(Session)
            .filter(Session.user_id == current_user.id)
            .filter(Session.end_datetime == None)
            .group_by(User.id)
        ).all()

        if query_results:
            payload = []
            for data in query_results:
                user: dict = data[0].serialize
                user["stats"] = calc_aggregate_sentiment(*data[1:])
                payload.append(user)

            return jsonify(payload)
        else:
            return jsonify({"error": "No data found", "status": 404}), 404
    return jsonify({"error": "Not authorized", "status": 404}), 404


@api.route("/session/student/complete", methods=["POST"])
@User.auth_required
def complete_students_profile(current_user):
    """Aggregated results of all students"""
    if current_user.is_teacher:
        query_results = (
            db.session.query(
                User,
                db.func.sum(Statistics.drowsiness_count),
                db.func.sum(Statistics.awaken_count),
                db.func.sum(Statistics.angry_count),
                db.func.sum(Statistics.disgust_count),
                db.func.sum(Statistics.fear_count),
                db.func.sum(Statistics.happy_count),
                db.func.sum(Statistics.sad_count),
                db.func.sum(Statistics.surprise_count),
                db.func.sum(Statistics.neutral_count),
                db.func.sum(Statistics.attendance_present),
                db.func.sum(Statistics.attendance_total),
            )
            .select_from(User)
            .join(Statistics)
            .join(Session)
            .group_by(User.id)
        ).all()

        if query_results:
            payload = []
            for data in query_results:
                user: dict = data[0].serialize_detail
                user["stats"] = calc_aggregate_sentiment(*data[1:])
                payload.append(user)

            return jsonify(payload)
        else:
            return jsonify({"error": "No data found", "status": 404}), 404
    return jsonify({"error": "Not authorized", "status": 404}), 404


@api.route("/student/<int:student_id>/marks", methods=["POST"])
# @login_required
@User.auth_required
def student_marks_update(current_user, student_id: int):
    """Student marks update"""

    if not current_user.is_teacher:
        return jsonify({"error": "Permission denied", "status": 403}), 403

    student: User = User.query.filter_by(
        id=student_id, is_teacher=False).first()

    if not student:
        return jsonify({"error": "No students found", "status": 404}), 404

    if request.headers.get("Content-Type") == "application/json":
        data = request.get_json()
        if data and isinstance(data, dict):
            student.assignment1 = data.get("assignment1", None)
            student.assignment2 = data.get("assignment2", None)
            student.test1 = data.get("test1", None)
            student.test2 = data.get("test2", None)
            student.midterm = data.get("midterm", None)
            student.final = data.get("final", None)

            db.session.commit()
        return jsonify(
            {"student": student.serialize_detail,
                "message": "success", "status": 200}
        )
    return jsonify({"error": "No data provided to update", "status": 400}), 400


@api.route("/student/marks", methods=["POST"])
# @login_required
@User.auth_required
def students_marks_bulk_update(current_user):
    """Bulk students marks update.

    Json values in a list is expected as given below.

    .. code-block:: python

       [
           {
               "id": 1,
               "assignment1": 10,
               "assignment2": 10,
               "test1": 15,
               "test2": 15,
               "midterm": 20,
               "final": 30
           }
       ]

    """

    if not current_user.is_teacher:
        return jsonify({"error": "Permission denied", "status": 403}), 403

    if request.headers.get("Content-Type") == "application/json":
        accepted_fields = [
            "id",
            "assignment1",
            "assignment2",
            "test1",
            "test2",
            "midterm",
            "final",
        ]
        data = request.get_json()

        if data and isinstance(data, list):
            for obj in data:
                try:
                    # remove other fields

                    for key in obj.keys():
                        if key not in accepted_fields:
                            obj.pop(key)
                except:
                    return (
                        jsonify(
                            {
                                "error": "Invalid data format passed in request",
                                "status": 400,
                            }
                        ),
                        400,
                    )
            # Note: Does not check whether the id given is student's or not
            db.session.bulk_update_mappings(User, data)
            db.session.commit()

        return jsonify({"message": "success", "status": 200})
    return jsonify({"error": "No data provided to update", "status": 400}), 400
