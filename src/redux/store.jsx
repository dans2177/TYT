// src/redux/store.js

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import muscleTagReducer from "./slices/muscleTagsSlice";
import exerciseReducer from "./slices/exerciseSlice";
import workoutReducer from "./slices/workoutSlice";
import exerciseTrackingReducer from "./slices/exerciseTrackingSlice"; // Import the new reducer here

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    muscleTags: muscleTagReducer,
    exercises: exerciseReducer,
    workout: workoutReducer,
    exerciseTracking: exerciseTrackingReducer, // Add the new reducer here

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable non-serializable check (temporary solution)
    }),
});
