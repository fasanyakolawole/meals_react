import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from '../store/slices/authSlice';
import { initializeCart } from '../store/slices/cartSlice';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AddressScreen from '../screens/AddressScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.auth || { token: null, hasAddress: false });
  const token = auth?.token;
  const hasAddress = auth?.hasAddress;

  useEffect(() => {
    // Initialize auth and cart from storage
    dispatch(initializeAuth());
    dispatch(initializeCart());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'default',
          animationDuration: Platform.OS === 'android' ? 300 : undefined,
        }}
      >
        {!token ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : !hasAddress ? (
          // Address screen if no address
          <Stack.Screen name="Address" component={AddressScreen} />
        ) : (
          // Main app screens
          <>
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
