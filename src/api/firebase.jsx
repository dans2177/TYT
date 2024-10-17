// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjsENVwUGHiHyTzHtv3olthLsj1r0W6fg",
  authDomain: "dspp-af487.firebaseapp.com",
  projectId: "dspp-af487",
  storageBucket: "dspp-af487.appspot.com",
  messagingSenderId: "243803488360",
  appId: "1:243803488360:web:2ce271c76f17746eed3bdd",
  measurementId: "G-KERBF9B6Q6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
