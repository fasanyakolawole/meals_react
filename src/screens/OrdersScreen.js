import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/client/orders');
      setOrders(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load orders. Please try again.';
      Alert.alert('Load Orders Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleOrder = (orderNumber) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }));
  };

  const isExpanded = (orderNumber) => {
    return expandedOrders[orderNumber] === true;
  };

  if (loading) {
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
            <Text style={styles.headerTitle}>My Orders</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
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
            <Text style={styles.headerTitle}>My Orders</Text>
          </View>
        </View>
        <View style={styles.emptyOrders}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your past orders will appear here</Text>
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
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {orders.map((order) => (
          <View key={order.orderNumber} style={styles.orderCard}>
            <TouchableOpacity
              style={styles.orderHeader}
              onPress={() => toggleOrder(order.orderNumber)}
            >
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                <Text style={styles.restaurantName}>{order.restaurant}</Text>
                <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
                {!isExpanded(order.orderNumber) && (
                  <Text style={styles.orderSummaryText}>
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} • £{order.totalPrice.toFixed(2)}
                  </Text>
                )}
              </View>
              <View style={styles.orderHeaderRight}>
                {isExpanded(order.orderNumber) && (
                  <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>£{order.totalPrice.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.expandIcon, isExpanded(order.orderNumber) && styles.expanded]}>
                  <Text style={styles.expandIconText}>›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {isExpanded(order.orderNumber) && (
              <View style={styles.orderDetails}>
                <View style={styles.orderItems}>
                  {order.orderItems.map((item) => (
                    <View key={item.itemId} style={styles.orderItem}>
                      <Image
                        source={{ uri: item.itemImage }}
                        style={styles.itemImage}
                        defaultSource={{ uri: 'https://naijameals.com/img/coming_soon.jpg' }}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                          <Text style={styles.itemPrice}>£{item.itemPrice}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemTotal}>£{item.price.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service Charge</Text>
                    <Text style={styles.summaryValue}>£{order.serviceCharge.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>£{order.deliveryPrice.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryValue}>£{order.totalPrice.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('OrderTracking', { orderId: order.orderNumber })}
                  >
                    <Text style={styles.continueButtonText}>Track My Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 14,
  },
  emptyOrders: {
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: 4,
  },
  orderSummaryText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
    marginTop: 4,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  expandIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expanded: {
    transform: [{ rotate: '90deg' }],
  },
  expandIconText: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  orderDetails: {
    paddingTop: 16,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 12,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  itemQuantity: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  itemPrice: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  orderSummary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
  },
  summaryLabel: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontWeight: '400',
    fontSize: 14,
  },
  summaryValue: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
    fontSize: 14,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    fontSize: 16,
  },
  continueButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default OrdersScreen;
