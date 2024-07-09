// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz3yom9hnl8sZMTM2Hj3kZR-4lKVdGVoU",
  authDomain: "phoronetworks.firebaseapp.com",
  projectId: "phoronetworks",
  storageBucket: "phoronetworks.appspot.com",
  messagingSenderId: "816791508897",
  appId: "1:816791508897:web:87730eef4d7fbfe67d9de0",
  measurementId: "G-1E8CR7CGTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
