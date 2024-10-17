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
    height: null,
    weight: null,
    workoutDays: null,
    introComplete: false,
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
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
export const updateProfile = (profile) => async (dispatch) => {
  const auth = getAuth();
  const db = getFirestore();
  dispatch(setLoading(true));
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    // Save the profile to Firestore
    await setDoc(doc(db, "users", userId), profile, { merge: true });
    dispatch(setProfile(profile));
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
    if (!userId) throw new Error("User not authenticated");

    const profileDoc = await getDoc(doc(db, "users", userId));
    if (profileDoc.exists()) {
      dispatch(setProfile(profileDoc.data()));
    } else {
      // Create a new profile if it doesn't exist
      const newProfile = {
        height: null,
        weight: null,
        workoutDays: null,
        introComplete: false,
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

// Async action to create a new user profile in Firestore
export const createProfile = (profile) => async (dispatch) => {
  const auth = getAuth();
  const db = getFirestore();
  dispatch(setLoading(true));
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    // Create a new profile in Firestore
    await setDoc(doc(db, "users", userId), profile);
    dispatch(setProfile(profile));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default userSlice.reducer;
