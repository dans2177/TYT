// src/api/firebase.js

// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDjsENVwUGHiHyTzHtv3olthLsj1r0W6fg",
  authDomain: "dspp-af487.firebaseapp.com",
  projectId: "dspp-af487",
  storageBucket: "dspp-af487.appspot.com",
  messagingSenderId: "243803488360",
  appId: "1:243803488360:web:2ce271c76f17746eed3bdd",
  measurementId: "G-KERBF9B6Q6",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Export the Firestore and Auth instances for use in other files
export { db, auth };
