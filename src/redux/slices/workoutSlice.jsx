// src/redux/slices/workoutSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Async thunk for loading workouts from Firestore
export const loadWorkouts = createAsyncThunk(
  "workouts/loadWorkouts",
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const workoutsRef = collection(db, "users", userId, "workouts");

      // Fetch workouts data from Firestore
      const querySnapshot = await getDocs(workoutsRef);
      const workouts = {};
      querySnapshot.forEach((doc) => {
        workouts[doc.id] = doc.data();
      });

      return workouts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding or updating a workout in Firestore
export const addOrUpdateWorkoutInFirestore = createAsyncThunk(
  "workouts/addOrUpdateWorkoutInFirestore",
  async ({ date, workout }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const workoutDocRef = doc(db, "users", userId, "workouts", date);

      // Save workout to Firestore
      await setDoc(workoutDocRef, workout, { merge: true });

      // Return the workout with the date as the key
      return { date, workout };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  workouts: {},
  status: "idle",
  error: null,
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load Workouts
      .addCase(loadWorkouts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadWorkouts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.workouts = action.payload;
      })
      .addCase(loadWorkouts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add or Update Workout
      .addCase(addOrUpdateWorkoutInFirestore.fulfilled, (state, action) => {
        const { date, workout } = action.payload;
        state.workouts[date] = workout;
      })
      // Handle errors
      .addMatcher(
        (action) =>
          action.type.endsWith("rejected") &&
          ["addOrUpdateWorkoutInFirestore"].includes(action.type.split("/")[1]),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default workoutSlice.reducer;
