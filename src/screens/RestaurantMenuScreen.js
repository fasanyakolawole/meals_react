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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchRestaurantItems, setPreferredRestaurant, fetchRestaurants } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartButton from '../components/CartButton';

const RestaurantMenuScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const restaurantId = route.params?.id;

  useEffect(() => {
    loadRestaurantInfo();
    loadMenuItems();
  }, [restaurantId]);

  const loadRestaurantInfo = async () => {
    let restaurant = route.params?.restaurant;
    
    if (!restaurant) {
      const storedRestaurant = await AsyncStorage.getItem('selectedRestaurant');
      if (storedRestaurant) {
        try {
          const parsed = JSON.parse(storedRestaurant);
          if (parsed.id === restaurantId) {
            restaurant = parsed;
          }
        } catch (e) {
          console.error('Failed to parse stored restaurant:', e);
        }
      }
    }
    
    if (restaurant && restaurant.id === restaurantId) {
      setRestaurantName(restaurant.name || 'Restaurant');
      setRestaurantAddress(restaurant.fullAddress || '');
      await AsyncStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    } else {
      fetchRestaurantFromList();
    }
  };

  const fetchRestaurantFromList = async () => {
    try {
      const restaurants = await dispatch(fetchRestaurants()).unwrap();
      const restaurant = restaurants.find(r => r.restaurant.id === restaurantId);
      if (restaurant && restaurant.restaurant) {
        setRestaurantName(restaurant.restaurant.name);
        setRestaurantAddress(restaurant.restaurant.fullAddress);
        await AsyncStorage.setItem('selectedRestaurant', JSON.stringify(restaurant.restaurant));
      }
    } catch (error) {
      setRestaurantName('Restaurant');
      setRestaurantAddress('');
    }
  };

  const loadMenuItems = async () => {
    if (!restaurantId) {
      Alert.alert('Error', 'Restaurant ID not found');
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      dispatch(setPreferredRestaurant(restaurantId)).catch(err => {
        console.error('Failed to set preferred restaurant:', err);
      });
      
      const data = await dispatch(fetchRestaurantItems(restaurantId)).unwrap();
      setItems(data || []);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load menu items. Please try again.';
      Alert.alert('Load Menu Failed', errorMessage);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
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
            <Text style={styles.headerTitle}>{restaurantName}</Text>
            {restaurantAddress && <Text style={styles.headerSubtitle}>{restaurantAddress}</Text>}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
        <CartButton />
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
            <Text style={styles.headerTitle}>{restaurantName}</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={loadMenuItems}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <CartButton />
      </View>
    );
  }

  if (items.length === 0) {
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
            <Text style={styles.headerTitle}>{restaurantName}</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items available</Text>
        </View>
        <CartButton />
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
          <Text style={styles.headerTitle}>{restaurantName}</Text>
          {restaurantAddress && <Text style={styles.headerSubtitle}>{restaurantAddress}</Text>}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 + insets.bottom }]}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.menuItemCard, !item.inStock && styles.outOfStock]}
          >
            <View style={styles.itemImageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                defaultSource={{ uri: 'https://naijameals.com/img/coming_soon.jpg' }}
              />
              {!item.inStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.badgeText}>Out of Stock</Text>
                </View>
              )}
              {item.isExtra && (
                <View style={styles.extraBadge}>
                  <Text style={styles.badgeText}>Extra</Text>
                </View>
              )}
            </View>
            
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
              </View>
              
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
              
              {item.inStock && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <CartButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  header: {
    backgroundColor: '#388E3C',
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
  retryButton: {
    padding: 10,
    paddingHorizontal: 24,
    backgroundColor: '#388E3C',
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
  menuItemCard: {
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
  outOfStock: {
    opacity: 0.6,
  },
  itemImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.87)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  extraBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.87)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  itemInfo: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  itemDescription: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default RestaurantMenuScreen;
