// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuwPX64X8RByX-pLeLshn0e5tvxk1l1xU",
  authDomain: "mystudyplan-6cdde.firebaseapp.com",
  projectId: "mystudyplan-6cdde",
  storageBucket: "mystudyplan-6cdde.firebasestorage.app",
  messagingSenderId: "976006567025",
  appId: "1:976006567025:web:134a738630788215fff7d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
