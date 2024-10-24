// src/redux/slices/workoutsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Async thunk for loading a specific workout by date from Firestore
export const loadWorkoutByDate = createAsyncThunk(
  "workouts/loadWorkoutByDate",
  async (date, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const workoutDocRef = doc(db, "users", userId, "workouts", date);

      const workoutSnap = await getDoc(workoutDocRef);
      if (workoutSnap.exists()) {
        return { date, workout: { id: workoutSnap.id, ...workoutSnap.data() } };
      } else {
        // If not found, create a default blank workout
        const defaultWorkout = {
          date,
          stretch: false,
          cardio: {
            type: "treadmill",
            time: 10,
          },
          isStarted: false,
          isCompleted: false,
        };
        await setDoc(workoutDocRef, defaultWorkout);
        return { date, workout: { id: workoutDocRef.id, ...defaultWorkout } };
      }
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
      return { date, workout: { id: workoutDocRef.id, ...workout } };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for starting a workout
export const startWorkout = createAsyncThunk(
  "workouts/startWorkout",
  async ({ date }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const workoutDocRef = doc(db, "users", userId, "workouts", date);

      // Update 'isStarted' to true
      await setDoc(workoutDocRef, { isStarted: true }, { merge: true });

      // Fetch updated workout
      const workoutSnap = await getDoc(workoutDocRef);
      if (workoutSnap.exists()) {
        return { date, workout: { id: workoutSnap.id, ...workoutSnap.data() } };
      } else {
        throw new Error("Workout not found after starting.");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for completing a workout
export const completeWorkout = createAsyncThunk(
  "workouts/completeWorkout",
  async ({ date }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const workoutDocRef = doc(db, "users", userId, "workouts", date);

      // Update 'isStarted' to false and add 'isCompleted' if needed
      await setDoc(
        workoutDocRef,
        { isStarted: false, isCompleted: true },
        { merge: true }
      );

      // Fetch updated workout
      const workoutSnap = await getDoc(workoutDocRef);
      if (workoutSnap.exists()) {
        return { date, workout: { id: workoutSnap.id, ...workoutSnap.data() } };
      } else {
        throw new Error("Workout not found after completing.");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  workouts: {}, // { [date]: { id, date, stretch, cardio, isStarted, isCompleted } }
  status: "idle",
  error: null,
};

const workoutsSlice = createSlice({
  name: "workouts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load Workout By Date
      .addCase(loadWorkoutByDate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadWorkoutByDate.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { date, workout } = action.payload;
        state.workouts[date] = workout;
      })
      .addCase(loadWorkoutByDate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add or Update Workout
      .addCase(addOrUpdateWorkoutInFirestore.fulfilled, (state, action) => {
        const { date, workout } = action.payload;
        state.workouts[date] = workout;
      })
      .addCase(addOrUpdateWorkoutInFirestore.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Start Workout
      .addCase(startWorkout.fulfilled, (state, action) => {
        const { date, workout } = action.payload;
        state.workouts[date] = workout;
      })
      .addCase(startWorkout.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Complete Workout
      .addCase(completeWorkout.fulfilled, (state, action) => {
        const { date, workout } = action.payload;
        state.workouts[date] = workout;
      })
      .addCase(completeWorkout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default workoutsSlice.reducer;
