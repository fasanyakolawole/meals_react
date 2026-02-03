import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

// Async thunk to initialize auth from AsyncStorage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const hasAddress = await AsyncStorage.getItem('hasAddress');
      const postcode = await AsyncStorage.getItem('postcode');
      
      return {
        token: token || null,
        hasAddress: hasAddress === 'true' || false,
        postcode: postcode || null,
        user: null,
      };
    } catch (error) {
      return {
        token: null,
        hasAddress: false,
        postcode: null,
        user: null,
      };
    }
  }
);

const initialState = {
  token: null,
  hasAddress: false,
  postcode: null,
  user: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('hasAddress', String(response.data.hasAddress));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', credentials);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('hasAddress', String(response.data.hasAddress));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveAddress = createAsyncThunk(
  'auth/saveAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/client/address', addressData);
      await AsyncStorage.setItem('hasAddress', 'true');
      const postcode = addressData.postcode.replace(/\s+/g, '').toLowerCase();
      await AsyncStorage.setItem('postcode', postcode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRestaurants = createAsyncThunk(
  'auth/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/client/restaurant/find');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRestaurantItems = createAsyncThunk(
  'auth/fetchRestaurantItems',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/client/restaurant/items/${restaurantId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setPreferredRestaurant = createAsyncThunk(
  'auth/setPreferredRestaurant',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/client/preferred/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to set preferred restaurant:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrderTracking = createAsyncThunk(
  'auth/fetchOrderTracking',
  async (orderId, { rejectWithValue }) => {
    try {
      const timestamp = new Date().getTime();
      console.log(`[API] Making GET request to /auth/client/tracking/${orderId}?t=${timestamp}`);
      const response = await api.get(`/auth/client/tracking/${orderId}`, {
        params: { t: timestamp },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log(`[API] Response received for order ${orderId}:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`[API] Error fetching order tracking for ${orderId}:`, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      AsyncStorage.setItem('token', action.payload);
    },
    setHasAddress: (state, action) => {
      state.hasAddress = action.payload;
      AsyncStorage.setItem('hasAddress', String(action.payload));
    },
    setPostcode: (state, action) => {
      state.postcode = action.payload;
      AsyncStorage.setItem('postcode', action.payload);
    },
    clearAuth: (state) => {
      state.token = null;
      state.hasAddress = false;
      state.postcode = null;
      state.user = null;
      AsyncStorage.multiRemove(['token', 'hasAddress', 'postcode']);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.hasAddress = action.payload.hasAddress;
        state.postcode = action.payload.postcode;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.hasAddress = action.payload.hasAddress;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.hasAddress = action.payload.hasAddress;
      })
      .addCase(saveAddress.fulfilled, (state) => {
        state.hasAddress = true;
      });
  },
});

export const { setToken, setHasAddress, setPostcode, clearAuth } = authSlice.actions;

export const selectIsAuthenticated = (state) => !!state?.auth?.token;
export const selectHasAddress = (state) => state?.auth?.hasAddress || false;
export const selectPostcode = (state) => state?.auth?.postcode;

export default authSlice.reducer;
