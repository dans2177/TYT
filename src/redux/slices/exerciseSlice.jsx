// src/redux/slices/exerciseSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../api/firebase"; // Import Firestore and Auth instances

// Async thunk for loading exercises from Firestore
export const loadExercises = createAsyncThunk(
  "exercises/loadExercises",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const exercisesRef = collection(db, "users", userId, "exercises");

      // Fetch exercises data from Firestore
      const querySnapshot = await getDocs(exercisesRef);
      const exercises = [];
      querySnapshot.forEach((docSnap) => {
        exercises.push({ id: docSnap.id, ...docSnap.data() });
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
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
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
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const exerciseDocRef = doc(db, "users", userId, "exercises", exercise.id);

      // Update exercise in Firestore
      await setDoc(exerciseDocRef, exercise, { merge: true });

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
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const exerciseDocRef = doc(db, "users", userId, "exercises", exerciseId);

      // Delete exercise from Firestore
      await deleteDoc(exerciseDocRef);

      return exerciseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state for the slice
const initialState = {
  data: [],
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  fetchError: null,
  addStatus: "idle",
  addError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

// Create the slice
const exercisesSlice = createSlice({
  name: "exercises",
  initialState,
  reducers: {
    // You can add synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      // Load Exercises
      .addCase(loadExercises.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(loadExercises.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadExercises.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload;
      })

      // Add Exercise
      .addCase(addExerciseToFirestore.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addExerciseToFirestore.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.data.push(action.payload);
      })
      .addCase(addExerciseToFirestore.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })

      // Update Exercise
      .addCase(updateExerciseInFirestore.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateExerciseInFirestore.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.data.findIndex(
          (exercise) => exercise.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateExerciseInFirestore.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })

      // Delete Exercise
      .addCase(deleteExerciseFromFirestore.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteExerciseFromFirestore.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.data = state.data.filter(
          (exercise) => exercise.id !== action.payload
        );
      })
      .addCase(deleteExerciseFromFirestore.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      });
  },
});

// Export the reducer to be included in the store
export default exercisesSlice.reducer;
