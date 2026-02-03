import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { selectCartItemCount } from '../store/slices/cartSlice';

const CartButton = () => {
  const navigation = useNavigation();
  const itemCount = useSelector(selectCartItemCount);
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.cartButton, { bottom: 5 + insets.bottom }]}
      onPress={() => navigation.navigate('Cart')}
      activeOpacity={0.8}
    >
      <Text style={styles.cartIcon}>🛒</Text>
      {itemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0c4204',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cartIcon: {
    fontSize: 28,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#BA1A1A',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default CartButton;
