// src/redux/slices/workoutExerciseTrackingSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Async thunk for loading exercise tracking for a specific workout
export const loadExerciseTracking = createAsyncThunk(
  "workoutExerciseTracking/loadExerciseTracking",
  async ({ workoutId, exerciseId }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const trackingDocRef = doc(
        db,
        "users",
        userId,
        "workoutExerciseTracking",
        workoutId,
        "exercises",
        exerciseId
      );

      const trackingSnap = await getDoc(trackingDocRef);
      if (trackingSnap.exists()) {
        return {
          workoutId,
          exerciseId,
          tracking: trackingSnap.data(),
        };
      } else {
        // If not found, create a default tracking
        const defaultTracking = {
          sets: [],
        };
        await setDoc(trackingDocRef, defaultTracking);
        return {
          workoutId,
          exerciseId,
          tracking: defaultTracking,
        };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding or updating exercise tracking in Firestore
export const addOrUpdateExerciseTrackingInFirestore = createAsyncThunk(
  "workoutExerciseTracking/addOrUpdateExerciseTrackingInFirestore",
  async ({ workoutId, exerciseId, tracking }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const trackingDocRef = doc(
        db,
        "users",
        userId,
        "workoutExerciseTracking",
        workoutId,
        "exercises",
        exerciseId
      );

      // Save tracking to Firestore
      await setDoc(trackingDocRef, tracking, { merge: true });

      // Return the updated tracking
      return { workoutId, exerciseId, tracking };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tracking: {}, // { [workoutId]: { [exerciseId]: { sets: [[reps, weight], ...] } } }
  status: "idle",
  error: null,
};

const workoutExerciseTrackingSlice = createSlice({
  name: "workoutExerciseTracking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load Exercise Tracking
      .addCase(loadExerciseTracking.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadExerciseTracking.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { workoutId, exerciseId, tracking } = action.payload;
        if (!state.tracking[workoutId]) {
          state.tracking[workoutId] = {};
        }
        state.tracking[workoutId][exerciseId] = tracking;
      })
      .addCase(loadExerciseTracking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add or Update Exercise Tracking
      .addCase(
        addOrUpdateExerciseTrackingInFirestore.fulfilled,
        (state, action) => {
          const { workoutId, exerciseId, tracking } = action.payload;
          if (!state.tracking[workoutId]) {
            state.tracking[workoutId] = {};
          }
          state.tracking[workoutId][exerciseId] = tracking;
        }
      )
      .addCase(
        addOrUpdateExerciseTrackingInFirestore.rejected,
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default workoutExerciseTrackingSlice.reducer;
