// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAv_Livr2SwtXJqqK3fx8UaNSWP8Qi7_T8",
  authDomain: "grit-comic.firebaseapp.com",
  projectId: "grit-comic",
  storageBucket: "grit-comic.firebasestorage.app",
  messagingSenderId: "309217261233",
  appId: "1:309217261233:web:d19ca422ffd7696bded490",
  measurementId: "G-NWHCSM2CLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);