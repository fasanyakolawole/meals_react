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
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchRestaurants } from '../store/slices/authSlice';
import { clearCart } from '../store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartButton from '../components/CartButton';
import MenuButton from '../components/MenuButton';
import SlideDrawer from '../components/SlideDrawer';

const RestaurantsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dispatch(fetchRestaurants()).unwrap();
      setRestaurants(data || []);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load restaurants. Please try again.';
      Alert.alert('Load Restaurants Failed', errorMessage);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const selectRestaurant = async (restaurant) => {
    const selectedRestaurant = await AsyncStorage.getItem('selectedRestaurant');
    let isDifferentRestaurant = true;

    if (selectedRestaurant) {
      try {
        const parsed = JSON.parse(selectedRestaurant);
        isDifferentRestaurant = parsed.id !== restaurant.id;
      } catch (e) {
        isDifferentRestaurant = true;
      }
    }

    if (isDifferentRestaurant) {
      dispatch(clearCart());
      Alert.alert('Cart Cleared', 'Your cart is now cleared');
    }

    await AsyncStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));

    navigation.navigate('RestaurantMenu', {
      id: restaurant.id,
      restaurant: restaurant,
    });
  };

  const handleImageError = (event) => {
    event.target.src = 'https://naijameals.com/img/coming_soon.jpg';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MenuButton />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Naija Meals</Text>
            <Text style={styles.headerSubtitle}>Find your favorite meals nearby</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
        <CartButton />
        <SlideDrawer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MenuButton />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Naija Meals</Text>
            <Text style={styles.headerSubtitle}>Find your favorite meals nearby</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={loadRestaurants}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <CartButton />
        <SlideDrawer />
      </View>
    );
  }

  if (restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MenuButton />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Naija Meals</Text>
            <Text style={styles.headerSubtitle}>Find your favorite meals nearby</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found in your area</Text>
        </View>
        <CartButton />
        <SlideDrawer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MenuButton />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Naija Meals</Text>
          <Text style={styles.headerSubtitle}>Find your favorite meals nearby</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 + insets.bottom }]}>
        {restaurants.map((item) => (
          <TouchableOpacity
            key={item.restaurant.id}
            style={[styles.restaurantCard, !item.restaurant.active && styles.restaurantDisabled]}
            onPress={() => item.restaurant.active && selectRestaurant(item.restaurant)}
            disabled={!item.restaurant.active}
          >
            <View style={styles.restaurantImageContainer}>
              <Image
                source={{ uri: item.restaurant.image }}
                style={styles.restaurantImage}
                defaultSource={{ uri: 'https://naijameals.com/img/coming_soon.jpg' }}
              />
              {item.restaurant.isPromoted && (
                <View style={styles.promotedBadge}>
                  <Text style={styles.badgeText}>Promoted</Text>
                </View>
              )}
              {item.restaurant.freeDelivery && (
                <View style={styles.deliveryBadge}>
                  <Text style={styles.badgeText}>Free Delivery</Text>
                </View>
              )}
            </View>

            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{item.restaurant.name}</Text>

              <View style={styles.restaurantRating}>
                <Text style={styles.ratingStars}>★</Text>
                <Text style={styles.ratingValue}>{item.restaurant.rating}</Text>
                <Text style={styles.reviewCount}>({item.restaurant.reviewCount})</Text>
              </View>

              <View style={styles.restaurantDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>🏍️</Text>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>{item.distanceMiles}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{item.estimatedTime}</Text>
                </View>
              </View>

              <View style={styles.restaurantAddress}>
                <Text style={styles.addressIcon}>📍</Text>
                <Text style={styles.addressText}>{item.restaurant.fullAddress}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CartButton />
      <SlideDrawer />
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
  retryButton: {
    padding: 10,
    paddingHorizontal: 24,
    backgroundColor: '#EF712E',
    borderRadius: 0,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 14,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  restaurantDisabled: {
    opacity: 0.5,
  },
  restaurantImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promotedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
  },
  deliveryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF712E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
    marginBottom: 4,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  ratingStars: {
    color: '#fbbf24',
    fontSize: 18,
  },
  ratingValue: {
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
  },
  reviewCount: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 12,
  },
  restaurantDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailLabel: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 12,
  },
  detailValue: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    fontWeight: '400',
  },
  restaurantAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
  },
  addressIcon: {
    fontSize: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
  },
});

export default RestaurantsScreen;
