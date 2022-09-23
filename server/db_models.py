import datetime
from functools import wraps
import os
import random
import statistics

from flask import request, jsonify
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from settings import db, app


class User(UserMixin, db.Model):
    """User model"""

    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120))  # nullable=False
    last_name = db.Column(db.String(120))
    email = db.Column(db.String(150), index=True, unique=True)
    password = db.Column(db.String(255))
    joined_at = db.Column(db.DateTime(), default=datetime.datetime.now)
    is_teacher = db.Column(db.Boolean, default=False)
    """User type is teacher or student"""

    profile_photo = db.relationship(
        "Image", backref="User", lazy=True, uselist=False)
    """One-To-One relationship with Image"""

    # Teacher particular fields
    sessions = db.relationship("Session", backref="teacher")

    # Student's particular fields
    student_sessions = db.relationship(
        "Session", secondary="statistics", back_populates="students"
    )

    assignment1 = db.Column(db.Float(), nullable=True)
    assignment2 = db.Column(db.Float(), nullable=True)
    midterm = db.Column(db.Float(), nullable=True)
    test1 = db.Column(db.Float(), nullable=True)
    test2 = db.Column(db.Float(), nullable=True)
    final = db.Column(db.Float(), nullable=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_marks_available(self):
        """Check if student marks are ready or not"""
        return any(
            [
                self.assignment1,
                self.assignment2,
                self.test1,
                self.test2,
                self.midterm,
                self.final,
            ]
        )

    @property
    def total_score(self):
        """Sum of all marks"""
        if not self.is_marks_available:
            return None
        total = 0
        total += self.assignment1 if self.assignment1 else 0
        total += self.assignment2 if self.assignment2 else 0
        total += self.test1 if self.test1 else 0
        total += self.test2 if self.test2 else 0
        total += self.midterm if self.midterm else 0
        total += self.final if self.final else 0
        return total

    @property
    def total_score_predicted(self):
        """Predicted total score sample"""

        if not self.is_marks_available:
            return None

        wg_assignment = 10
        wg_test = 15
        wg_mid = 20
        wg_final = 30
        total = 0
        assigned_marks_count = 0

        if self.assignment1:
            total += self.assignment1 / wg_assignment
            assigned_marks_count += 1
        if self.assignment2:
            total += self.assignment2 / wg_assignment
            assigned_marks_count += 1
        if self.test1:
            total += self.test1 / wg_test
            assigned_marks_count += 1
        if self.test2:
            total += self.test2 / wg_test
            assigned_marks_count += 1
        if self.midterm:
            total += self.midterm / wg_mid
            assigned_marks_count += 1
        if self.final:
            total += self.final / wg_final
            assigned_marks_count += 1

        total = round(total * 100 / assigned_marks_count) - \
            random.randint(0, 3)
        return total

    def set_password(self, pass_key):
        self.password = generate_password_hash(pass_key)

    def check_password(self, pass_key):
        return check_password_hash(self.password, pass_key)

    @property
    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_teacher": self.is_teacher,
            # "profile_photo": self.profile_photo.id,
        }

    @property
    def serialize_detail(self):
        """For student detailed view"""

        if self.is_teacher:
            return self.serialize

        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_teacher": self.is_teacher,
            "marks": {
                "assignment1": self.assignment1,
                "assignment2": self.assignment2,
                "test1": self.test1,
                "test2": self.test2,
                "mid_term": self.midterm,
                "final": self.final,
                "total": self.total_score,
                "predicted_total": self.total_score_predicted,
            },
        }

    @property
    def serialize_complete(self):
        """For student aggregate view"""

        if self.is_teacher:
            return self.serialize

        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_teacher": self.is_teacher,
            "marks": {
                "assignment1": self.assignment1,
                "assignment2": self.assignment2,
                "test1": self.test1,
                "test2": self.test2,
                "mid_term": self.midterm,
                "final": self.final,
                "total": self.total_score,
                "predicted_total": self.total_score_predicted,
            },
        }

    @property
    def serialize_stats(self):
        """For student stats for session view"""

        if self.is_teacher:
            return self.serialize

        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            # "statistics": [statistics.serialize_stats for statistics in self.student_sessions]
        }

    @property
    def pfp_filename(self):
        """Profile photo's filename"""
        return f"{self.full_name}-{self.id}.jpg"

    @staticmethod
    def auth_required(func):
        """Decorator for checking credentials using basic auth.

        For successful auth, current_user is passed to func.

        """

        @wraps(func)
        def decorator(*args, **kwargs):
            # Note: preferred is using basic auth with username&password
            email = request.authorization.get("username", None)
            password = request.authorization.get("password", None)
            # email = request.json.get("email", None)
            # password = request.json.get("password", None)

            if not email and not password:
                return jsonify({"message": "Unauthorized", "status": 401}), 401

            current_user = User.query.filter_by(email=email).first()
            if not current_user or not current_user.check_password(password):
                return (
                    jsonify(
                        {"message": "Invalid credentials provided", "status": 400}),
                    400,
                )

            return func(current_user, *args, **kwargs)

        return decorator


class Session(db.Model):
    """Session model"""

    __tablename__ = "session"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    """ForeignKey relationship with User; only applicable to teacher"""
    start_datetime = db.Column(db.DateTime(), default=datetime.datetime.now)
    end_datetime = db.Column(db.DateTime(), nullable=True)

    students = db.relationship(
        "User", secondary="statistics", back_populates="student_sessions"
    )

    @property
    def is_active(self):
        return self.end_datetime == None

    @property
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "start_time": self.start_datetime,
            "end_time": self.end_datetime,
            "is_active": self.is_active,
            "teacher": self.teacher.serialize,
        }

    @property
    def serialize_complete(self):
        # ADD STUDENT INFORMATION
        return {
            "id": self.id,
            "user_id": self.user_id,
            "start_time": self.start_datetime,
            "end_time": self.end_datetime,
            "is_active": self.is_active,
            "students": [student.serialize_stats for student in self.students]
        }


class Statistics(db.Model):
    """Model for Student Statistics during a Session: Drowsiness and Emotions

    Drowsiness count and Emotions count increment by 1 on every
    image proccessing during the session. Only one of the emotion
    count is incremented and drowsy count will increment based on the
    drowsiness value.

    """

    __tablename__ = "statistics"

    # id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    """ForeignKey relationship with User; only applicable to student"""
    session_id = db.Column(db.Integer, db.ForeignKey(
        "session.id"), primary_key=True)
    """ForeignKey relationship with Session"""

    # If drowsy=true (or > some limit) count++ else don't increment
    drowsiness_count = db.Column(db.Integer, default=0)
    """Number of being drowsy during the session"""
    awaken_count = db.Column(db.Integer, default=0)
    """Number of being awaken during the session"""

    # EMOTIONS
    angry_count = db.Column(db.Integer, default=0)
    disgust_count = db.Column(db.Integer, default=0)
    fear_count = db.Column(db.Integer, default=0)
    happy_count = db.Column(db.Integer, default=0)
    sad_count = db.Column(db.Integer, default=0)
    surprise_count = db.Column(db.Integer, default=0)
    neutral_count = db.Column(db.Integer, default=0)

    attendance_present = db.Column(db.Integer, default=0)
    attendance_total = db.Column(db.Integer, default=0)

    is_closed = db.Column(db.Boolean, default=False)
    """Statistics closed when session ends"""

    @property
    def attendance_precent(self):
        """Percetage attendance"""
        return round(self.attendance_present / self.attendance_total * 100)

    @property
    def serialize(self):
        return {
            # "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "drowsiness": {
                "drowsy": self.drowsiness_count,
                "awaken": self.awaken_count,
            },
            "emotion": {
                "angry": self.angry_count,
                "disgust": self.disgust_count,
                "fear": self.fear_count,
                "happy": self.happy_count,
                "sad": self.sad_count,
                "surprise": self.surprise_count,
                "neutral": self.neutral_count,
            },
            "attendance": self.attendance_precent,
        }

    @property
    def serialize_stats(self):
        """:return: Only statistics"""
        return {
            "drowsiness": {
                "drowsy": self.drowsiness_count,
                "awaken": self.awaken_count,
            },
            "emotion": {
                "angry": self.angry_count,
                "disgust": self.disgust_count,
                "fear": self.fear_count,
                "happy": self.happy_count,
                "sad": self.sad_count,
                "surprise": self.surprise_count,
                "neutral": self.neutral_count,
            },
            "attendance": self.attendance_precent,
        }

    def update_statistics_count(self, emotion: str, drowsy: str, face: str):
        """Update statistics count"""

        # Attendance from FACE
        self.attendance_total += 1  # On every call attend + 1
        if face.lower() != "unknown":
            self.attendance_present += 1

        # Emotion
        if emotion.lower() == "angry":
            self.angry_count += 1
        elif emotion.lower() == "disgust":
            self.disgust_count += 1
        elif emotion.lower() == "fear":
            self.fear_count += 1
        elif emotion.lower() == "happy":
            self.happy_count += 1
        elif emotion.lower() == "sad":
            self.sad_count += 1
        elif emotion.lower() == "surprise":
            self.surprise_count += 1
        elif emotion.lower() == "neutral":
            self.neutral_count += 1

        # Drowsy
        if drowsy == "drowsy":
            self.drowsiness_count += 1
        else:
            self.awaken_count += 1


class Image(db.Model):
    """Image model"""

    id = db.Column(db.Integer, primary_key=True)
    image_blob = db.Column(db.LargeBinary)
    is_pfp = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    """OneToOne relationship for user pfp"""


# if not os.path.isfile("database.db"):
#     print("## New database created. {}".format(os.path.curdir))
db.create_all()
