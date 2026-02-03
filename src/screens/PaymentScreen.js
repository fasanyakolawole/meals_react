import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { clearCart } from '../store/slices/cartSlice';
import { selectCartSubtotal, selectDeliveryFee, selectServiceFee } from '../store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { confirmPayment } = useStripe();
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  
  const clientSecret = route.params?.clientSecret;
  const orderId = route.params?.orderId;
  const totalAmount = route.params?.totalAmount || 0;
  
  const cartSubtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const serviceFee = useSelector(selectServiceFee);

  useEffect(() => {
    if (!clientSecret) {
      Alert.alert('Payment Error', 'Missing payment information. Please try again.');
      navigation.goBack();
    }
  }, []);

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Payment Error', 'Please enter valid card details');
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'Succeeded') {
        dispatch(clearCart());
        await AsyncStorage.removeItem('selectedRestaurant');
        
        navigation.replace('PaymentSuccess', {
          orderId: orderId,
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Payment Error', 'An error occurred during payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>Complete your order</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.orderIconContainer}>
                <Text style={styles.orderIcon}>📦</Text>
              </View>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{cartSubtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.feeRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.feeInfo}>ℹ️</Text>
              </View>
              <Text style={styles.summaryValue}>£{deliveryFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>£{serviceFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>£{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Card */}
          <View style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💳</Text>
              </View>
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.cardInputContainer}>
              <Text style={styles.cardInputLabel}>Card Number</Text>
              <CardField
                postalCodeEnabled={false}
                cardStyle={{
                  backgroundColor: '#F5F5F5',
                  textColor: '#1A1A1A',
                  borderWidth: 1,
                  borderColor: cardDetails?.complete ? '#388E3C' : '#E0E0E0',
                  borderRadius: 8,
                  fontSize: 16,
                }}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setCardDetails(cardDetails);
                }}
              />
            </View>
            
            <View style={styles.securitySection}>
              <View style={styles.securityRow}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.securityText}>Secured by </Text>
                <Text style={styles.stripeLogo}>Stripe</Text>
              </View>
              <Text style={styles.securitySubtext}>Your payment information is encrypted</Text>
            </View>
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            style={[styles.payButton, (processing || !cardDetails?.complete) && styles.buttonDisabled]}
            onPress={handlePayment}
            disabled={processing || !cardDetails?.complete}
            activeOpacity={0.8}
          >
            {processing ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.payButtonText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.payButtonText}>Pay £{totalAmount.toFixed(2)}</Text>
                <Text style={styles.payButtonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <Text style={styles.trustText}>SSL Encrypted</Text>
            </View>
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>PCI Compliant</Text>
            </View>
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>🔐</Text>
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#EF712E',
    padding: 14,
    paddingTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginLeft: -2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Order Summary Card
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderIcon: {
    fontSize: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeInfo: {
    fontSize: 12,
    color: '#999999',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginTop: 8,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    color: '#388E3C',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Payment Card
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginTop: 0,
    marginBottom: 12,
  },
  cardInputContainer: {
    marginBottom: 0,
  },
  cardInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 12,
  },
  cardField: {
    width: '100%',
    height: 56,
    marginVertical: 0,
  },
  securitySection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lockIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#666666',
  },
  stripeLogo: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
  },
  securitySubtext: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  // Payment Button
  payButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: '#388E3C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  payButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustIcon: {
    fontSize: 14,
  },
  trustText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
});

export default PaymentScreen;
