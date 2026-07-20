 

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';

// 1. Configuration
 
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 2. Request Interceptor: Auth & Logging
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Attach Token
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --- DEBUG LOGGING ---
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('╔════════ AXIOS REQUEST ════════╗');
    console.log(`║ 🚀 METHOD: ${config.method?.toUpperCase()}`);
    console.log(`║ 🔗 URL:    ${fullUrl}`);

    if (config.data) {
      if (config.data instanceof FormData) {
        // Special log for Images/Files (FormData)
        console.log('║ 📦 PAYLOAD: [FormData Body]');
        // In React Native, we can inspect FormData parts like this:
        console.log('║ ✨ PARTS:', (config.data as any)._parts);
      } else {
        // Standard JSON log
        console.log(`║ 📦 PAYLOAD: ${JSON.stringify(config.data, null, 2)}`);
      }
    } else {
      console.log('║ 📦 PAYLOAD: No Body');
    }
    console.log('╚═══════════════════════════════╝');

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Global Success & Error Handling
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log success


    console.log("===========================",response)
    console.log(`✅ [${response.status}] Response from: ${response.config.url}`);
    
    // Return only the data portion to your services
    return response.data;
  },
  async (error: AxiosError) => {

console.log("=========+++++++++++====",error.response)


    const status = error.response?.status;
    const url = error.config?.url;

    console.log(`❌ [${status || 'NETWORK_ERROR'}] Error from: ${url}`);

    // Handle Unauthorized (401)
    if (status === 401) {
      console.warn('Unauthorized! Cleaning up session...');
      await AsyncStorage.removeItem('userToken');
      // Optional: Add logic to navigate to Login screen or trigger a logout event
    }

    // Handle Network Timeout/Connection issues
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        status: 503,
      });
    }

    // Parse and return a clean error object
    return Promise.reject(parseApiError(error));
  }
);

/**
 * Utility: Parse API Errors into user-friendly messages
 */
const parseApiError = (error: AxiosError<any>) => {
  const data = error.response?.data;
  
  // Custom logic based on how your backend sends errors
  const message = 
    data?.message || 
    data?.error || 
    data?.msg || 
    'Something went wrong. Please try again.';

  return {
    status: error.response?.status,
    message: message,
    errors: data?.errors || null, // For validation errors (e.g. email already exists)
    raw: data,
  };
};

export default axiosClient;