import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectDeliveryFee,
  selectServiceFee,
  selectCartTotal,
  updateQuantity,
  removeFromCart,
  fetchDeliveryFee,
  clearCart,
} from '../store/slices/cartSlice';
import api from '../services/api';

const CartScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const serviceFee = useSelector(selectServiceFee);
  const cartTotal = useSelector(selectCartTotal);
  const [loadingFee, setLoadingFee] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    loadDeliveryFee();
    fetchDeliveryAddress();
  }, []);

  // Reset processing state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setProcessingCheckout(false);
    }, [])
  );

  const loadDeliveryFee = async () => {
    setLoadingFee(true);
    try {
      await dispatch(fetchDeliveryFee()).unwrap();
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load delivery fee. Please try again.';
      Alert.alert('Load Delivery Fee Failed', errorMessage);
    } finally {
      setLoadingFee(false);
    }
  };

  const fetchDeliveryAddress = async () => {
    try {
      const response = await api.get('/auth/client/address');
      const data = response.data;
      const addressParts = [];
      if (data.address) {
        addressParts.push(data.address);
      }
      setDeliveryAddress(addressParts.join(',') || 'No address available');
    } catch (error) {
      setDeliveryAddress('No address available');
    }
  };

  const confirmAction = () => {
    Alert.alert(
      'Delivery Address',
      deliveryAddress,
      [
        { text: 'Edit', onPress: () => navigation.navigate('Address'), style: 'cancel' },
        { text: 'Continue', onPress: checkout },
      ]
    );
  };

  const checkout = async () => {
    if (processingCheckout) return;
    
    setProcessingCheckout(true);
    
    try {
      const items = cartItems.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
      }));
      
      const response = await api.post('/api/client/restaurant/complete', items);
      
      const { clientSecret, orderId } = response.data;
      
      if (!clientSecret || !orderId) {
        throw new Error('Invalid response from server');
      }
      
      navigation.navigate('Payment', {
        clientSecret,
        orderId,
        totalAmount: cartTotal,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to proceed to checkout. Please try again.';
      Alert.alert('Checkout Failed', errorMessage);
      setProcessingCheckout(false);
    }
  };

  const increaseQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      dispatch(updateQuantity({ itemId, quantity: item.quantity + 1 }));
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      dispatch(updateQuantity({ itemId, quantity: item.quantity - 1 }));
    }
  };

  const removeItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContainer}>
              <Text style={styles.backIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Cart</Text>
          </View>
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add items from the menu to get started</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => navigation.goBack()}>
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Cart Items</Text>
          <Text style={styles.headerSubtitle}>
            {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 280 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              defaultSource={{ uri: 'https://naijameals.com/img/coming_soon.jpg' }}
            />
            
            <View style={styles.itemDetails}>
              <View style={styles.itemHeaderRow}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemBottomRow}>
                <Text style={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseQuantity(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <View style={styles.cartSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>£{cartSubtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            {loadingFee ? (
              <ActivityIndicator size="small" color="#388E3C" />
            ) : (
              <Text style={styles.summaryValue}>£{deliveryFee.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>£{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {loadingFee ? '...' : `£${cartTotal.toFixed(2)}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, processingCheckout && styles.buttonDisabled]}
          onPress={confirmAction}
          disabled={processingCheckout || loadingFee}
          activeOpacity={0.8}
        >
          {processingCheckout ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
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
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    fontWeight: '500',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.87)',
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 280,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 8,
    fontWeight: '400',
  },
  emptyText: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 14,
    marginBottom: 32,
  },
  browseButton: {
    padding: 10,
    paddingHorizontal: 24,
    backgroundColor: '#EF712E',
    borderRadius: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  itemTextContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 6,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#388E3C',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  quantityButtonText: {
    color: '#388E3C',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.87)',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cartSummary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '400',
    fontSize: 15,
    letterSpacing: 0.15,
  },
  summaryValue: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '500',
    fontSize: 15,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.15,
  },
  totalValue: {
    color: '#388E3C',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.15,
  },
  checkoutButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#EF712E',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default CartScreen;
