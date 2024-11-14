// src/api/firebase.js

// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Firebase configuration
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

// Set up Firebase Auth with platform-specific persistence
let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Export Firestore and Auth instances
export { db, auth };
