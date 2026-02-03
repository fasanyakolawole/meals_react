import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

// Async thunk to initialize cart from AsyncStorage
export const initializeCart = createAsyncThunk(
  'cart/initializeCart',
  async () => {
    try {
      const cartItems = await AsyncStorage.getItem('cartItems');
      return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
      return [];
    }
  }
);

const initialState = {
  items: [],
  deliveryFee: 0,
};

export const fetchDeliveryFee = createAsyncThunk(
  'cart/fetchDeliveryFee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/client/restaurant/price');
      return response.data.delivery_fee || 0;
    } catch (error) {
      console.error('Failed to fetch delivery fee:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...item,
          quantity: 1
        });
      }
      AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(i => i.id === itemId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      AsyncStorage.removeItem('cartItems');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchDeliveryFee.fulfilled, (state, action) => {
        state.deliveryFee = action.payload;
      })
      .addCase(fetchDeliveryFee.rejected, (state) => {
        state.deliveryFee = 0;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state?.cart?.items || [];
export const selectCartItemCount = (state) => {
  const items = state?.cart?.items || [];
  return items.reduce((total, item) => total + item.quantity, 0);
};
export const selectCartSubtotal = (state) => {
  const items = state?.cart?.items || [];
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};
export const selectDeliveryFee = (state) => state?.cart?.deliveryFee || 0;
export const selectServiceFee = () => 1.5; // Flat service fee
export const selectCartTotal = (state) => {
  const items = state?.cart?.items || [];
  const deliveryFee = state?.cart?.deliveryFee || 0;
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return subtotal + deliveryFee + 1.5; // Subtotal + Delivery Fee + Service Fee
};

export default cartSlice.reducer;
