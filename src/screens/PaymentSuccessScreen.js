import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = route.params?.orderId;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>Your order has been placed successfully.</Text>
        {orderId && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoText}>
              Order ID: <Text style={styles.orderId}>{orderId}</Text>
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
        >
          <Text style={styles.trackButtonText}>Track Your Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Restaurants')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#388E3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: 24,
    textAlign: 'center',
  },
  orderInfo: {
    backgroundColor: 'rgba(56, 142, 60, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  orderInfoText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'center',
  },
  orderId: {
    color: '#388E3C',
    fontWeight: '500',
  },
  trackButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  continueButton: {
    width: '100%',
    padding: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  continueButtonText: {
    color: '#388E3C',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default PaymentSuccessScreen;
