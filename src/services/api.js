import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.naijameals.com',
  // baseURL: ' http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - Unauthorized
      // Clear all auth data
      await AsyncStorage.multiRemove([
        'token',
        'hasAddress',
        'postcode',
        'cartItems',
        'selectedRestaurant',
      ]);
      
      // Note: In React Native, navigation should be handled in the component
      // We'll dispatch an action or use navigation ref
    }
    return Promise.reject(error);
  }
);

export default api;
