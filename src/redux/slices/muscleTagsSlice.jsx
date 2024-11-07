// muscleTagsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Toast from "react-native-root-toast";

// Async thunk for saving muscle tags to Firestore
export const saveMuscleTags = createAsyncThunk(
  "muscleTags/saveMuscleTags",
  async (muscleTags, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const batch = writeBatch(db);

      // Fetch existing days from Firestore to identify deletions
      const collectionRef = collection(db, "users", userId, "muscleTags");
      const existingDocs = await getDocs(collectionRef);
      const existingDays = existingDocs.docs.map((doc) => doc.id);

      const newDays = Object.keys(muscleTags);
      const daysToDelete = existingDays.filter((day) => !newDays.includes(day));

      // Delete removed days
      daysToDelete.forEach((day) => {
        const docRef = doc(db, "users", userId, "muscleTags", day);
        batch.delete(docRef);
      });

      // Set or update existing days
      newDays.forEach((day) => {
        const tags = muscleTags[day];
        const docRef = doc(db, "users", userId, "muscleTags", day);
        batch.set(docRef, { tags });
      });

      await batch.commit();

      return muscleTags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading muscle tags from Firestore
export const loadMuscleTags = createAsyncThunk(
  "muscleTags/loadMuscleTags",
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user authenticated");

      const userId = user.uid;
      const db = getFirestore();
      const collectionRef = collection(db, "users", userId, "muscleTags");
      const querySnapshot = await getDocs(collectionRef);

      const muscleTags = {};
      querySnapshot.forEach((doc) => {
        muscleTags[doc.id] = doc.data().tags;
      });

      // Ensure at least one empty day if no muscle tags exist
      if (Object.keys(muscleTags).length === 0) {
        muscleTags["1"] = [];
      }

      return muscleTags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const muscleTagsSlice = createSlice({
  name: "muscleTags",
  initialState: {
    muscleTags: { 1: [] }, // Ensure initial state always has at least one day
    status: "idle",
    error: null,
  },
  reducers: {
    // Optionally, you can add local reducers here
  },
  extraReducers: (builder) => {
    builder
      // Handle saveMuscleTags actions
      .addCase(saveMuscleTags.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveMuscleTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.muscleTags = action.payload;
      })
      .addCase(saveMuscleTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        Toast.show(`Failed to save muscle tags: ${action.payload}`, {
          duration: Toast.durations.LONG,
        });
      })
      // Handle loadMuscleTags actions
      .addCase(loadMuscleTags.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadMuscleTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.muscleTags = action.payload; // Action payload will include at least one empty day
      })
      .addCase(loadMuscleTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        Toast.show(`Failed to load muscle tags: ${action.payload}`, {
          duration: Toast.durations.LONG,
        });
      });
  },
});

export default muscleTagsSlice.reducer;
