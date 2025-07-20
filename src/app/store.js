import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import templateReducer from '../features/auth/templateSlice'; // ✅ Correct path

export const store = configureStore({
  reducer: {
    auth: authReducer,
    template: templateReducer,
  },
});
