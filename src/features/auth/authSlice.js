// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

/* ------------------------------------------------------------------
   THUNKS
------------------------------------------------------------------- */
// 1️⃣  Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ loginValue, password }, { rejectWithValue }) => {
    try {
      const isEmail = /\S+@\S+\.\S+/.test(loginValue);
      const payload = isEmail
        ? { email: loginValue, password }
        : { mobile: loginValue, password };

      const { data } = await axios.post(`${API_URL}/auth/login`, payload);

      // Persist token for page refreshes
      localStorage.setItem('token', data.token);
      return { token: data.token, user: data.user || null };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed, please try again.'
      );
    }
  }
);

// 2️⃣  Register (NEW)
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, formData);
      // Some APIs return a token right away ─ if yours does, store it.
      if (data.token) localStorage.setItem('token', data.token);
      return { token: data.token || null, user: data.user || null };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed, please try again.'
      );
    }
  }
);

/* ------------------------------------------------------------------
   SLICE
------------------------------------------------------------------- */
const initialState = {
  isAuthenticated: Boolean(localStorage.getItem('token')),
  token: localStorage.getItem('token'),
  user: null,
  status: 'idle',       // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    /* ───── Login ───── */
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      /* ───── Register ───── */
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // If you log the user in immediately after register
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

/* ------------------------------------------------------------------
   EXPORTS
------------------------------------------------------------------- */
export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
