import { createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";

const initialState = {
  profile: {
    height: { feet: null, inches: null }, // Store height as an object
    weight: null, // in pounds
    workoutDay: null,
    introComplete: false,
    email: null, // add email field to the profile
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload; // Replace entire profile
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProfile: (state) => {
      state.profile = initialState.profile;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setProfile, setLoading, setError, clearProfile } =
  userSlice.actions;

// Async action to create or update user profile in Firestore
export const updateProfile = (profileUpdates) => async (dispatch, getState) => {
  const auth = getAuth();
  const db = getFirestore();
  dispatch(setLoading(true));
  try {
    const userId = auth.currentUser?.uid;
    const email = auth.currentUser?.email; // Get the user's email from Firebase Auth
    if (!userId) throw new Error("User not authenticated");

    // Get current profile from state
    const currentProfile = getState().user.profile;

    // Merge current profile with updates
    const updatedProfile = {
      ...currentProfile,
      ...profileUpdates,
      email, // Ensure email is always included
    };

    // Save the updated profile to Firestore with merge
    await setDoc(doc(db, "users", userId), updatedProfile, { merge: true });
    dispatch(setProfile(updatedProfile));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Async action to read user profile from Firestore
export const fetchProfile = () => async (dispatch) => {
  const auth = getAuth();
  const db = getFirestore();
  dispatch(setLoading(true));
  try {
    const userId = auth.currentUser?.uid;
    const email = auth.currentUser?.email; // Get the user's email from Firebase Auth
    if (!userId) throw new Error("User not authenticated");

    const profileDoc = await getDoc(doc(db, "users", userId));
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      // Ensure email is included in the profile if it's not there already
      const profileWithEmail = { ...profileData, email };
      dispatch(setProfile(profileWithEmail));
    } else {
      // Create a new profile with email if it doesn't exist
      const newProfile = {
        height: { feet: null, inches: null },
        weight: null,
        workoutDay: 1,
        introComplete: false,
        email,
      };
      await setDoc(doc(db, "users", userId), newProfile);
      dispatch(setProfile(newProfile));
    }
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Async action to delete user profile from Firestore
export const deleteProfile = () => async (dispatch) => {
  const auth = getAuth();
  const db = getFirestore();
  dispatch(setLoading(true));
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    // Delete the profile from Firestore
    await deleteDoc(doc(db, "users", userId));
    dispatch(clearProfile());
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default userSlice.reducer;
