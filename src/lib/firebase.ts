import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBxYxsLtsHK1cKKn6IP_wY5FLyG3Gqje5c",
    authDomain: "study-tracker-9d996.firebaseapp.com",
    projectId: "study-tracker-9d996",
    storageBucket: "study-tracker-9d996.firebasestorage.app",
    messagingSenderId: "896578359034",
    appId: "1:896578359034:web:730cec1b11329f22960343",
    measurementId: "G-ZDH3EW4063"
};

import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
import { getStorage } from "firebase/storage";
export const db = getFirestore(app);
export const storage = getStorage(app);
