// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config/apiConfig';
import { UserProfile } from '../../types/user';

type LoginPayload = {
  email: string;
  password: string;
};

type AuthPayload = {
  token: string | null;
  user: UserProfile | null;
};

type UpdateProfilePayload = {
  name?: string;
  mobile?: string;
  photoBase64?: string;
};

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
// Thunk to check if a token exists on startup
export const checkStoredToken = createAsyncThunk<AuthPayload, void, { rejectValue: string }>(
  'auth/checkStoredToken',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const response = await axios.get(`${BASE_URL}/users/me`);
        const userData = response.data.data || response.data;


        console.log("=====checkStoredToken==",userData)
        return { token: savedToken, user: userData };
      }
      return { token: null, user: null };
    } catch (error: any) {
      await AsyncStorage.removeItem('userToken');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

// Thunk for Logging In
// export const loginUser = createAsyncThunk<AuthPayload, LoginPayload, { rejectValue: string }>(
//   'auth/loginUser',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
//       if (response.data.success) {
//                 console.log("=====loginUser==",response.data.data)

//          const { token, ...userData } = response.data.data || response.data;
//         await AsyncStorage.setItem('userToken', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         return { token, user: userData };
//       }
//       return rejectWithValue(response.data.message || 'Login failed');
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Network error occurred');
//     }
//   }
// );


// src/redux/authSlice.js

export const loginUser = createAsyncThunk<AuthPayload, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 1. Authenticate
      const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
      
      if (response.data.success) {
        const { token } = response.data.data;
        
        // 2. Save token and set header for the next immediate call
        await AsyncStorage.setItem('userToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 3. Fetch the FULL profile immediately
        const profileResponse = await axios.get(`${BASE_URL}/users/me`);
        const fullUserData = profileResponse.data.data || profileResponse.data;

        return { token, user: fullUserData };
      }
      return rejectWithValue(response.data.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Network error');
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

export const updateMyProfile = createAsyncThunk<
  UserProfile,
  UpdateProfilePayload,
  { rejectValue: string }
>(
  'auth/updateMyProfile',
  async ({ name, mobile, photoBase64 }, { rejectWithValue }) => {
    try {
      const payload: Record<string, any> = {};
      if (name !== undefined) {
        payload.name = name;
      }
      if (mobile !== undefined) {
        payload.mobile = mobile;
      }
      if (photoBase64) {
        payload.photo = {
          dataUri: `data:image/jpeg;base64,${photoBase64}`,
        };
      }

      const response = await axios.put(`${BASE_URL}/users/me`, payload);
      if (response.data?.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data?.message || 'Profile update failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: true,
    error: null,
  } as AuthState,
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
        state.error = (action.payload as string) || 'Session expired';
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
        state.error = (action.payload as string) || 'Login failed';
      })
      // Logout lifecycle
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Profile update failed';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
