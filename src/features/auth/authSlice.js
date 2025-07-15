// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ loginValue, password }, { rejectWithValue }) => {
    try {
      const isEmail = /\S+@\S+\.\S+/.test(loginValue);
      const payload = isEmail
        ? { email: loginValue, password }
        : { mobile: loginValue, password };

      const res = await axios.post('http://localhost:3000/auth/login', payload);

      // Save token locally
      localStorage.setItem('token', res.data.token);

      return {
        token: res.data.token,
        user: res.data.user || {}, // optional
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    user: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
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
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      });
  }
});

// Selectors
export const selectAuth = (state) => state.auth;
export const { logout } = authSlice.actions;

export default authSlice.reducer;
