import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../../api/firebase.jsx";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for signing in
export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const {
        uid,
        email: userEmail,
        displayName,
        emailVerified,
        phoneNumber,
        photoURL,
      } = userCredential.user;
      return {
        uid,
        userEmail,
        displayName,
        emailVerified,
        phoneNumber,
        photoURL,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for registering
export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const {
        uid,
        email: userEmail,
        displayName,
        emailVerified,
        phoneNumber,
        photoURL,
      } = userCredential.user;
      return {
        uid,
        userEmail,
        displayName,
        emailVerified,
        phoneNumber,
        photoURL,
      };
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        return rejectWithValue(
          "The email address is already in use by another account."
        );
      }
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await signOut(auth);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = {
        uid: action.payload.uid,
        userEmail: action.payload.email,
        displayName: action.payload.displayName,
        emailVerified: action.payload.emailVerified,
        phoneNumber: action.payload.phoneNumber,
        photoURL: action.payload.photoURL,
      };
      state.loading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginSuccess, logoutSuccess, setLoading, setError } =
  authSlice.actions;
export default authSlice.reducer;
