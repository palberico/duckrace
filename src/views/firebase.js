import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDd5MdJGZC30amPs7_vb7v9EyFvIX8rD-c",
  authDomain: "raceducks.firebaseapp.com",
  projectId: "raceducks",
  storageBucket: "raceducks.appspot.com",
  messagingSenderId: "26834943334",
  appId: "1:26834943334:web:bd0c427f3ad92e8b00dca7",
  measurementId: "G-S5KRXVSGR4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);