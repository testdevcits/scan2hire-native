// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config/apiConfig';
import { UserProfile } from '../../types/user';


interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
// Thunk to check if a token exists on startup
export const checkStoredToken = createAsyncThunk(
  'auth/checkStoredToken',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const response = await axios.get(`${BASE_URL}/employees/me`);
        const userData = response.data.data || response.data;
        return { token: savedToken, user: userData };
      }
      return { token: null, user: null };
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

// Thunk for Logging In
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        await AsyncStorage.setItem('userToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { token, user: userData };
      }
      return rejectWithValue(response.data.message || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Network error occurred');
    }
  }
);

// Thunk for Logging Out
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await AsyncStorage.removeItem('userToken');
    delete axios.defaults.headers.common['Authorization'];
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check stored token lifecycle
      .addCase(checkStoredToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkStoredToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(checkStoredToken.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      // Login lifecycle
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout lifecycle
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;