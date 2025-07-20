import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// 🔁 FETCH TEMPLATES
export const fetchTemplates = createAsyncThunk(
  'template/fetchTemplates',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/templates/filter`,
        {
          page: 1,
          limit: 100,
          search: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data; // return the array of templates directly
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ➕ CREATE TEMPLATE
export const createTemplate = createAsyncThunk(
  'template/createTemplate',
  async (templateData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/templates`, templateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✏️ UPDATE TEMPLATE
export const updateTemplate = createAsyncThunk(
  'template/updateTemplate',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/templates/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ❌ DELETE TEMPLATE
export const deleteTemplate = createAsyncThunk(
  'template/deleteTemplate',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      await axios.delete(`${API_BASE}/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ TEMPLATE SLICE
const templateSlice = createSlice({
  name: 'template',
  initialState: {
    templates: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // 🔄 Fetch
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload || [];
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch templates';
      })

      // ➕ Create
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create template';
      })

      // ✏️ Update
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update template';
      })

      // ❌ Delete
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete template';
      });
  }
});

export default templateSlice.reducer;

// 🔍 SELECTOR
export const selectTemplates = (state) => state.template.templates;
