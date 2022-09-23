export function saveUserSessionInLocalStorage(userData) {
  localStorage.setItem('session-user', JSON.stringify(userData));
}

export function getUserSessionFromLocalStorage() {
  return localStorage.getItem('session-user');
}

export function removeUserSessionFromLocalStorage() {
  return localStorage.removeItem('session-user');
}