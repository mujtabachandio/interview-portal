'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  inMemoryPersistence,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
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

// Initialize Firebase
let app;
let auth;
let analytics;

try {
  // Initialize Firebase app
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Analytics only in production and on client side
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }

  // Set up persistence
  if (typeof window !== 'undefined') {
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence set to LOCAL');
      } catch (error) {
        console.error("Local persistence error:", error);
        try {
          await setPersistence(auth, inMemoryPersistence);
          console.log('Auth persistence set to MEMORY');
        } catch (err) {
          console.error('Failed to set memory persistence:', err);
          throw err;
        }
      }
    };

    // Execute persistence setup
    setupPersistence().catch(error => {
      console.error('Failed to set up auth persistence:', error);
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Auth state observer
let authStateObserver = null;

const setupAuthStateObserver = () => {
  if (authStateObserver) return;

  authStateObserver = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Auth state: User is signed in', { 
        email: user.email,
        uid: user.uid 
      });
    } else {
      console.log('Auth state: User is signed out');
    }
  });
};

// Initialize auth state observer on client side
if (typeof window !== 'undefined') {
  setupAuthStateObserver();
}

// Helper function to handle sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { auth, handleSignOut }; 