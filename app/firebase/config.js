'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_g3Xjq2A9jFReDQ7L4AJyrW3-KH8RsFk",
  authDomain: "interview-portal-e5ce1.firebaseapp.com",
  projectId: "interview-portal-e5ce1",
  storageBucket: "interview-portal-e5ce1.firebasestorage.app",
  messagingSenderId: "1087378373159",
  appId: "1:1087378373159:web:3954aeda7191e72cbbec02",
  measurementId: "G-BP1P105W4H"
};

// Initialize Firebase only on the client side
let app;
let auth;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  
  // Set persistence to LOCAL
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Auth persistence error:", error);
    });

  // Initialize analytics
  const analytics = getAnalytics(app);
}

export { auth }; 