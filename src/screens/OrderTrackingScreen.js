import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { fetchOrderTracking } from '../store/slices/authSlice';

const OrderTrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const orderId = route.params?.orderId;
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pollingInterval = useRef(null);

  useEffect(() => {
    loadTrackingData();
    startPolling();
    return () => stopPolling();
  }, [orderId]);

  const loadTrackingData = async (isPolling = false) => {
    if (!orderId) {
      setError(true);
      setErrorMessage('Order ID not found');
      return;
    }
    
    if (!isPolling) {
      setLoading(true);
      setError(false);
      setErrorMessage('');
    }
    
    try {
      const data = await dispatch(fetchOrderTracking(orderId)).unwrap();
      setTrackingData(data);
      setError(false);
      setErrorMessage('');
    } catch (error) {
      if (!isPolling) {
        setError(true);
        setErrorMessage(typeof error === 'string' ? error : error?.message || 'Failed to load order tracking. Please try again.');
        Alert.alert('Load Tracking Failed', errorMessage);
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const startPolling = () => {
    stopPolling();
    const POLLING_INTERVAL = 30 * 1000; // 30 seconds
    pollingInterval.current = setInterval(() => {
      loadTrackingData(true);
    }, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const callDriver = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTransportType = (type) => {
    if (!type) return 'Vehicle';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTransportIcon = (type) => {
    const icons = {
      bike: '🚴',
      car: '🚗',
      scooter: '🛵',
      walk: '🚶',
    };
    return icons[type] || '🚗';
  };

  const formattedStatus = trackingData
    ? trackingData.status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  const statusClass = trackingData
    ? trackingData.status.toLowerCase() === 'in_progress'
      ? 'statusInProgress'
      : trackingData.status.toLowerCase() === 'completed'
      ? 'statusCompleted'
      : trackingData.status.toLowerCase() === 'cancelled'
      ? 'statusCancelled'
      : 'statusPending'
    : '';

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
            <Text style={styles.headerTitle}>Order Tracking</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
            <Text style={styles.headerTitle}>Order Tracking</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTrackingData()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!trackingData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>Collection Code #{trackingData.id}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusHeaderTitle}>Order Status</Text>
            <View style={[styles.statusBadge, styles[statusClass]]}>
              <Text style={styles.statusBadgeText}>{formattedStatus}</Text>
            </View>
          </View>
        </View>

        {trackingData.driver && (
          <View style={styles.driverCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Your Driver</Text>
              <View style={styles.transportBadge}>
                <Text style={styles.transportBadgeText}>
                  {getTransportIcon(trackingData.driver.transport_type)} {formatTransportType(trackingData.driver.transport_type)}
                </Text>
              </View>
            </View>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {getInitials(trackingData.driver.display_name)}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{trackingData.driver.display_name}</Text>
                {trackingData.driver.phone && (
                  <TouchableOpacity onPress={() => callDriver(trackingData.driver.phone)}>
                    <Text style={styles.driverPhone}>📞 {trackingData.driver.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {trackingData.deliveries && trackingData.deliveries.length > 0 && (
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Delivery Timeline</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.pickup]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineContentTitle}>Pickup</Text>
                  <Text style={styles.timelineTime}>
                    {formatDateTime(trackingData.deliveries[0].eta.pickup)}
                  </Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.dropoff]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineContentTitle}>Estimated Delivery</Text>
                  <Text style={styles.timelineTime}>
                    {formatDateTime(trackingData.deliveries[0].eta.dropoff)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#c53030',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10b981',
    borderRadius: 0,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusInProgress: {
    backgroundColor: 'rgba(33, 150, 243, 0.12)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(244, 67, 54, 0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
  },
  driverCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  transportBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transportBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976D2',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: '#388E3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  driverPhone: {
    color: '#388E3C',
    fontSize: 14,
    fontWeight: '500',
  },
  timelineCard: {
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
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 32,
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    position: 'relative',
  },
  timelineMarker: {
    position: 'absolute',
    left: -36,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickup: {
    backgroundColor: '#1976D2',
  },
  dropoff: {
    backgroundColor: '#388E3C',
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginLeft: -36,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineContentTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
  },
});

export default OrderTrackingScreen;
