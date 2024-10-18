import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
      const docRef = doc(db, "muscleTags", userId);

      await setDoc(docRef, { muscleTags });

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
      const docRef = doc(db, "muscleTags", userId);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const muscleTags = docSnap.data().muscleTags;
        // Ensure at least one empty day if no muscle tags exist
        return Object.keys(muscleTags).length > 0 ? muscleTags : { 1: [] };
      } else {
        // Return one empty day if no document exists
        return { 1: [] };
      }
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
      });
  },
});

export default muscleTagsSlice.reducer;
