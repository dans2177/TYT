// src/redux/store.js

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import muscleTagReducer from "./slices/muscleTagsSlice";
import exerciseReducer from "./slices/exerciseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    muscleTags: muscleTagReducer,
    exercises: exerciseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable non-serializable check (temporary solution)
    }),
});
