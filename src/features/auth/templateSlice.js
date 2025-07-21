import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// 🔁 FETCH TEMPLATES WITH PAGINATION
export const fetchTemplates = createAsyncThunk(
  'template/fetchTemplates',
  async ({ page = 1, limit = 10, search = '' } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/templates/filter`,
        { page, limit, search },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // contains: data, total, page, limit
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
    total: 0,
    page: 1,
    limit: 10,
    search: '',
    loading: false,
    error: null
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setSearch(state, action) {
      state.search = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Fetch
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.data || [];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
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
        state.templates.unshift(action.payload); // insert at top
        state.total += 1;
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
        state.total -= 1;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete template';
      });
  }
});

export const { setPage, setSearch } = templateSlice.actions;
export default templateSlice.reducer;

// 🔍 SELECTORS
export const selectTemplates = (state) => state.template.templates;
export const selectTotalTemplates = (state) => state.template.total;
export const selectPage = (state) => state.template.page;
export const selectLimit = (state) => state.template.limit;
export const selectSearch = (state) => state.template.search;
export const selectTemplateLoading = (state) => state.template.loading;
export const selectTemplateError = (state) => state.template.error;
