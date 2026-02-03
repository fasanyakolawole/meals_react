import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QxvNKFqr0Ra5ZEVZ7cnlUnaXvjxezH50fd63JR4DizvQzRzU9acLAUrHs9cExzJZvQfsF8NmiIu6bHTm5AIOJ3B00kNKqVKlO';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar to be opaque with a white background color
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AppNavigator />
        </StripeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
