import axios from "axios";
import { useSelector } from "react-redux";

// const BASE_PATH = process.env.BASE_PATH;
const BASE_PATH = "http://localhost:5000";
const REGISTER_URL = "/register";
const LOGIN_URL = "/login";
const LOGOUT_URL = "/logout"
const ME_URL = "/me"
const STUDENT_URL = "/student";
const STUDENTS_URL = "/students";
const PROFILE_PIC_CURRENT_USER_URL = "/profile_pic"
const PROFILE_PIC_URL = "/profile_pic/<int:user_id>"
const SESSION_CREATE_URL = "/session/create";
const SESSION_END_URL = "/session/end";
const SESSION_LIST_URL = "/session/list";
const SESSION_COMPLETE = "/session/complete";
const SESSION_URL = "/session";
const SESSION_JOIN_URL = "/join";
const SESSION_STUDENT_ACTIVE_SESSION_URL = "/session/student/active-session";
const SESSION_STUDENT_COMPLETE_URL = "/session/student/complete";
const MARKS_URL = "/marks";
const STUDENTS_MARKS_URL = "/student/marks";


export function apiRegisterNewUser(registrationFormData) {
  const res = axios.post(BASE_PATH + REGISTER_URL,
    registrationFormData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    });
  return res;
}

export function apiLoginUser(loginFormData) {
  const res = axios.post(BASE_PATH + LOGIN_URL,
    loginFormData, {
    headers: { "Content-Type": "application/json" }
  });
  return res;
}

export function apiLogoutUser() {
  const res = axios.post(BASE_PATH + LOGOUT_URL);
  return res;
}

export function apiMe() {
  const res = axios.post(BASE_PATH + ME_URL);
  return res;
}

/**
 * Get all student list with marks
 * @returns 
 */
export function apiGetStudents() {
  const url = "/students";
  const res = axios.get(BASE_PATH + STUDENTS_URL);
  return res;
}

export function apiGetProfilePicUrl(id) {
  const url = BASE_PATH + PROFILE_PIC_CURRENT_USER_URL + "/" + id;
  return url;
}

export function apiGetCurrentUserProfilePic(user) {
  const url = "/profile_pic";
  const res = axios.get(BASE_PATH + PROFILE_PIC_CURRENT_USER_URL,
    {
      auth: {
        username: user.email,
        password: user.password
      }
    });
  return res;
}

export function apiGetProfilePicFromId(userId) {
  const res = axios.get(BASE_PATH + PROFILE_PIC_URL + "/" + userId);
  return res;
}

export function apiCreateSession(user) {
  const res = axios.post(
    BASE_PATH + SESSION_CREATE_URL, {},
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiEndSession(user) {
  const res = axios.post(BASE_PATH + SESSION_END_URL, {},
    {
      auth: {
        username: user.email,
        password: user.password
      }
    });
  return res;
}

export function apiGetSessions() {
  const res = axios.get(BASE_PATH + SESSION_LIST_URL);
  return res;
}

export function apiGetEntireSessionForTeacher(user) {
  const res = axios.get(BASE_PATH + SESSION_COMPLETE,
    {
      auth: {
        username: user.email,
        password: user.password
      }
    });
  return res;
}

export function apiSession() {
  const res = axios.post(BASE_PATH + SESSION_URL);
  return res;
}

export function apiGetActiveSessionDetails(user, sessionId) {
  const res = axios.get(BASE_PATH + SESSION_URL + "/" + sessionId,
    {
      auth: {
        username: user.email,
        password: user.password
      }
    });
  return res;
}

export function apiJoinSession(sessionId, user) {
  const res = axios.post(BASE_PATH + SESSION_URL + "/" + sessionId + SESSION_JOIN_URL, {},
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiGetSessionStatsForStudent(studentId, user) {
  const res = axios.get(BASE_PATH + SESSION_URL + STUDENT_URL + "/" + studentId,
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiAllStudentsDataForActiveSession(user) {
  const res = axios.post(BASE_PATH + SESSION_STUDENT_ACTIVE_SESSION_URL, {},
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiStudentsDataForAllSessions(user) {
  const res = axios.post(BASE_PATH + SESSION_STUDENT_COMPLETE_URL, {},
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiUpdateStudentMarks(user, studentId, data) {
  const res = axios.post(BASE_PATH + STUDENT_URL + "/" + studentId + MARKS_URL, data,
    {
      auth: {
        username: user.email,
        password: user.password
      }
    }
  );
  return res;
}

export function apiGetMarks() {
  const res = axios.get(BASE_PATH + STUDENTS_MARKS_URL);
  return res;
}
