import firebase from 'firebase/app'
import 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBnK9vhC8uBIBlAjqlJTYjyAGVNE3QYLIw",
    authDomain: "otp-new-file.firebaseapp.com",
    projectId: "otp-new-file",
    storageBucket: "otp-new-file.appspot.com",
    messagingSenderId: "1044570362413",
    appId: "1:1044570362413:web:5c6c98935697a43a8adea4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);



export default firebase;