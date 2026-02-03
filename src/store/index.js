import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import drawerReducer from './slices/drawerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    drawer: drawerReducer,
  },
});
