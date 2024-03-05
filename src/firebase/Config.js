import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDd5MdJGZC30amPs7_vb7v9EyFvIX8rD-c",
    authDomain: "raceducks.firebaseapp.com",
    projectId: "raceducks",
    storageBucket: "raceducks.appspot.com",
    messagingSenderId: "26834943334",
    appId: "1:26834943334:web:bd0c427f3ad92e8b00dca7",
    measurementId: "G-S5KRXVSGR4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

