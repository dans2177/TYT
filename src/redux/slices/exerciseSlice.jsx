// src/redux/slices/exerciseSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Async thunk for loading exercises from Firestore
export const loadExercises = createAsyncThunk(
  "exercises/loadExercises",
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const exercisesRef = collection(db, "users", userId, "exercises");

      // Fetch exercises data from Firestore
      const querySnapshot = await getDocs(exercisesRef);
      const exercises = [];
      querySnapshot.forEach((doc) => {
        exercises.push({ id: doc.id, ...doc.data() });
      });

      return exercises;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a new exercise to Firestore
export const addExerciseToFirestore = createAsyncThunk(
  "exercises/addExerciseToFirestore",
  async (exercise, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const exercisesRef = collection(db, "users", userId, "exercises");

      // Add exercise to Firestore (Firebase will generate an ID)
      const docRef = await addDoc(exercisesRef, exercise);

      // Return the new exercise with the generated ID
      return { id: docRef.id, ...exercise };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an exercise in Firestore
export const updateExerciseInFirestore = createAsyncThunk(
  "exercises/updateExerciseInFirestore",
  async (exercise, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const exerciseDocRef = doc(db, "users", userId, "exercises", exercise.id);

      // Update exercise in Firestore
      await setDoc(exerciseDocRef, exercise);

      return exercise;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an exercise from Firestore
export const deleteExerciseFromFirestore = createAsyncThunk(
  "exercises/deleteExerciseFromFirestore",
  async (exerciseId, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const exerciseDocRef = doc(db, "users", userId, "exercises", exerciseId);

      // Delete exercise from Firestore
      await deleteDoc(exerciseDocRef);

      return exerciseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const exercisesSlice = createSlice({
  name: "exercises",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load Exercises
      .addCase(loadExercises.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadExercises.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadExercises.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Exercise
      .addCase(addExerciseToFirestore.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      // Update Exercise
      .addCase(updateExerciseInFirestore.fulfilled, (state, action) => {
        const index = state.data.findIndex((ex) => ex.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      // Delete Exercise
      .addCase(deleteExerciseFromFirestore.fulfilled, (state, action) => {
        state.data = state.data.filter((ex) => ex.id !== action.payload);
      })
      // Handle errors
      .addMatcher(
        (action) =>
          action.type.endsWith("rejected") &&
          [
            "addExerciseToFirestore",
            "updateExerciseInFirestore",
            "deleteExerciseFromFirestore",
          ].includes(action.type.split("/")[1]),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default exercisesSlice.reducer;
