// src/redux/slices/workoutSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../api/firebase"; // Import Firestore and Auth instances

// Async thunk for loading a workout from Firestore
export const loadWorkout = createAsyncThunk(
  "workout/loadWorkout",
  async (date, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const workoutsRef = collection(db, "users", userId, "workouts");

      // Get the date to use
      let dateToUse = date;
      if (!dateToUse) {
        // Get today's date as YYYY-MM-DD string in local time
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        dateToUse = `${year}-${month}-${day}`;
      }

      // Query Firestore for a workout with the given date
      const q = query(workoutsRef, where("date", "==", dateToUse));
      const querySnapshot = await getDocs(q);

      let workout = null;

      if (!querySnapshot.empty) {
        // Workout exists
        const docSnap = querySnapshot.docs[0];
        workout = { id: docSnap.id, ...docSnap.data() };
      } else {
        // No workout exists for this date, create a blank one
        const blankWorkout = {
          date: dateToUse,
          workoutData: {}, // Empty workout data
          stretch: false,
          cardio: false,
          cardioType: "treadmill",
          cardioLength: 10,
          isStarted: false,
          isFinished: false,
          isRated: false,
          rating: 0,
        };

        // Add the blank workout to Firestore
        const docRef = await addDoc(workoutsRef, blankWorkout);

        // Set the workout to return
        workout = { id: docRef.id, ...blankWorkout };
      }

      return workout;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading all workouts from Firestore
export const loadAllWorkouts = createAsyncThunk(
  "workout/loadAllWorkouts",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const workoutsRef = collection(db, "users", userId, "workouts");

      // Fetch all workouts
      const querySnapshot = await getDocs(workoutsRef);

      const workouts = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return workouts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a new workout to Firestore
export const addWorkoutToFirestore = createAsyncThunk(
  "workout/addWorkoutToFirestore",
  async (workout, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const workoutsRef = collection(db, "users", userId, "workouts");

      // Add workout to Firestore (Firebase will generate an ID)
      const docRef = await addDoc(workoutsRef, workout);

      // Return the new workout with the generated ID
      return { id: docRef.id, ...workout };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a workout in Firestore
export const updateWorkoutInFirestore = createAsyncThunk(
  "workout/updateWorkoutInFirestore",
  async (workout, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const workoutDocRef = doc(db, "users", userId, "workouts", workout.id);

      // Update workout in Firestore
      await setDoc(workoutDocRef, workout, { merge: true });

      return workout;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a workout from Firestore
export const deleteWorkoutFromFirestore = createAsyncThunk(
  "workout/deleteWorkoutFromFirestore",
  async (workoutId, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const workoutDocRef = doc(db, "users", userId, "workouts", workoutId);

      // Delete workout from Firestore
      await deleteDoc(workoutDocRef);

      return workoutId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for starting the workout
export const startWorkout = createAsyncThunk(
  "workout/startWorkout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const state = getState();
      const workoutId = state.workout.data?.id;

      if (!workoutId) throw new Error("No workout loaded");

      const workoutDocRef = doc(db, "users", userId, "workouts", workoutId);

      // Update the isStarted field to true
      await updateDoc(workoutDocRef, { isStarted: true });

      // Return the updated field
      return { isStarted: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state for the slice
const initialState = {
  data: null, // Holds a single workout object
  workoutsList: [], // Holds all workouts
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  fetchError: null,
  fetchAllStatus: "idle", // Status for loading all workouts
  fetchAllError: null,
  addStatus: "idle",
  addError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
  startStatus: "idle",
  startError: null,
};

// Create the slice
const workoutsSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    // You can add synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      // Load Workout
      .addCase(loadWorkout.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(loadWorkout.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadWorkout.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload;
      })

      // Load All Workouts
      .addCase(loadAllWorkouts.pending, (state) => {
        state.fetchAllStatus = "loading";
        state.fetchAllError = null;
      })
      .addCase(loadAllWorkouts.fulfilled, (state, action) => {
        state.fetchAllStatus = "succeeded";
        state.workoutsList = action.payload;
      })
      .addCase(loadAllWorkouts.rejected, (state, action) => {
        state.fetchAllStatus = "failed";
        state.fetchAllError = action.payload;
      })

      // Add Workout
      .addCase(addWorkoutToFirestore.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addWorkoutToFirestore.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(addWorkoutToFirestore.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })

      // Update Workout
      .addCase(updateWorkoutInFirestore.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateWorkoutInFirestore.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(updateWorkoutInFirestore.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })

      // Delete Workout
      .addCase(deleteWorkoutFromFirestore.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteWorkoutFromFirestore.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.data = null; // Clear the current workout
      })
      .addCase(deleteWorkoutFromFirestore.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      })

      // Start Workout
      .addCase(startWorkout.pending, (state) => {
        state.startStatus = "loading";
        state.startError = null;
      })
      .addCase(startWorkout.fulfilled, (state, action) => {
        state.startStatus = "succeeded";
        if (state.data) {
          state.data.isStarted = true;
        }
      })
      .addCase(startWorkout.rejected, (state, action) => {
        state.startStatus = "failed";
        state.startError = action.payload;
      });
  },
});

// Export the reducer to be included in the store
export default workoutsSlice.reducer;
