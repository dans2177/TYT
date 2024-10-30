// src/redux/slices/exerciseTrackingSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../api/firebase";

// Async thunk for loading exercise tracking data for a specific workout
export const loadExerciseTrackingData = createAsyncThunk(
  "exerciseTracking/loadExerciseTrackingData",
  async (workoutId, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;

      // Reference to the exerciseTracking collection
      const exercisesRef = collection(
        db,
        "users",
        userId,
        "workouts",
        workoutId,
        "exerciseTracking"
      );

      // Fetch exercise tracking data from Firestore without ordering
      const querySnapshot = await getDocs(exercisesRef);
      const exerciseTrackingData = [];
      querySnapshot.forEach((docSnap) => {
        exerciseTrackingData.push({ id: docSnap.id, ...docSnap.data() });
      });

      return exerciseTrackingData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding new exercise tracking data to a workout in Firestore
export const addExerciseTrackingData = createAsyncThunk(
  "exerciseTracking/addExerciseTrackingData",
  async ({ workoutId, exerciseData }, { getState, rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;

      // Reference to the exerciseTracking collection
      const exercisesRef = collection(
        db,
        "users",
        userId,
        "workouts",
        workoutId,
        "exerciseTracking"
      );

      // Add exercise tracking data to Firestore
      const docRef = await addDoc(exercisesRef, exerciseData);

      // Return the new exercise tracking data with the generated ID
      return { id: docRef.id, ...exerciseData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating exercise tracking data in a workout in Firestore
export const updateExerciseTrackingData = createAsyncThunk(
  "exerciseTracking/updateExerciseTrackingData",
  async ({ workoutId, exerciseData }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;

      const exerciseDocRef = doc(
        db,
        "users",
        userId,
        "workouts",
        workoutId,
        "exerciseTracking",
        exerciseData.id
      );

      // Update exercise tracking data in Firestore
      await setDoc(exerciseDocRef, exerciseData, { merge: true });

      // Now, update the corresponding exercise's lastUsedWeight and lastUsedReps
      let lastUsedWeight = null;
      let lastUsedReps = null;

      if (exerciseData.sets && exerciseData.sets.length > 0) {
        // Get the weight and reps from the last set
        const lastSet = exerciseData.sets[exerciseData.sets.length - 1];
        lastUsedWeight = lastSet.weight;
        lastUsedReps = lastSet.reps;
      }

      // Get a reference to the exercise document in the exercises collection
      const exerciseId = exerciseData.exerciseId;
      const exerciseRef = doc(db, "users", userId, "exercises", exerciseId);

      // Update the lastUsedWeight and lastUsedReps fields in the exercise document
      await updateDoc(exerciseRef, {
        lastUsedWeight: lastUsedWeight,
        lastUsedReps: lastUsedReps,
      });

      // Return nothing since we don't want to overwrite the state
      return;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting exercise tracking data from a workout in Firestore
export const deleteExerciseTrackingData = createAsyncThunk(
  "exerciseTracking/deleteExerciseTrackingData",
  async ({ workoutId, exerciseId }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;

      const exerciseDocRef = doc(
        db,
        "users",
        userId,
        "workouts",
        workoutId,
        "exerciseTracking",
        exerciseId
      );

      // Delete exercise tracking data from Firestore
      await deleteDoc(exerciseDocRef);

      return exerciseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating the order of exercises in Firestore
export const updateExerciseOrder = createAsyncThunk(
  "exerciseTracking/updateExerciseOrder",
  async ({ workoutId, newOrder }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;

      // Use a batch to update all exercises' order field
      const batch = writeBatch(db);

      newOrder.forEach((exercise, index) => {
        const exerciseDocRef = doc(
          db,
          "users",
          userId,
          "workouts",
          workoutId,
          "exerciseTracking",
          exercise.id
        );
        batch.update(exerciseDocRef, { order: index });
      });

      await batch.commit();

      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state for the slice
const initialState = {
  data: [],
  fetchStatus: "idle",
  fetchError: null,
  addStatus: "idle",
  addError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
  updateOrderStatus: "idle",
  updateOrderError: null,
};

// Create the slice
const exerciseTrackingSlice = createSlice({
  name: "exerciseTracking",
  initialState,
  reducers: {
    clearExerciseTrackingData: (state) => {
      state.data = [];
      state.fetchStatus = "idle";
      state.fetchError = null;
    },
    updateExerciseTrackingDataInStore: (state, action) => {
      const index = state.data.findIndex(
        (exercise) => exercise.id === action.payload.id
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Exercise Tracking Data
      .addCase(loadExerciseTrackingData.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(loadExerciseTrackingData.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadExerciseTrackingData.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload;
      })

      // Add Exercise Tracking Data
      .addCase(addExerciseTrackingData.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addExerciseTrackingData.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.data.push(action.payload);
      })
      .addCase(addExerciseTrackingData.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })

      // Update Exercise Tracking Data
      .addCase(updateExerciseTrackingData.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateExerciseTrackingData.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        // Do not update the state here to avoid overwriting the current data
      })
      .addCase(updateExerciseTrackingData.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
        // Optionally, you can handle rollback logic here if needed
      })

      // Delete Exercise Tracking Data
      .addCase(deleteExerciseTrackingData.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteExerciseTrackingData.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.data = state.data.filter(
          (exercise) => exercise.id !== action.payload
        );
      })
      .addCase(deleteExerciseTrackingData.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      })

      // Update Exercise Order
      .addCase(updateExerciseOrder.pending, (state) => {
        state.updateOrderStatus = "loading";
        state.updateOrderError = null;
      })
      .addCase(updateExerciseOrder.fulfilled, (state, action) => {
        state.updateOrderStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(updateExerciseOrder.rejected, (state, action) => {
        state.updateOrderStatus = "failed";
        state.updateOrderError = action.payload;
      });
  },
});

// Export the reducer and actions
export const { clearExerciseTrackingData, updateExerciseTrackingDataInStore } =
  exerciseTrackingSlice.actions;
export default exerciseTrackingSlice.reducer;
