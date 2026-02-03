import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '../store/slices/drawerSlice';
import { clearAuth } from '../store/slices/authSlice';
import { Alert } from 'react-native';

const MenuContent = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const navigateTo = (route) => {
    dispatch(closeDrawer());
    navigation.navigate(route);
  };

  const customAlert = () => {
    Alert.alert('Maintenance', 'Sorry this is currently not available, please send an email to admin@naijameals.com');
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    dispatch(closeDrawer());
    navigation.navigate('Login');
  };

  return (
    <View style={styles.menuContent}>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Address')}>
        <Text style={styles.menuItemIcon}>📍</Text>
        <Text style={styles.menuItemText}>My Delivery Details</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Orders')}>
        <Text style={styles.menuItemIcon}>📦</Text>
        <Text style={styles.menuItemText}>My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={customAlert}>
        <Text style={styles.menuItemIcon}>💬</Text>
        <Text style={styles.menuItemText}>Contact Us</Text>
      </TouchableOpacity>
      
      <View style={styles.menuDivider} />

      <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleLogout}>
        <Text style={[styles.menuItemIcon, styles.menuItemDangerIcon]}>🔒</Text>
        <Text style={[styles.menuItemText, styles.menuItemDangerText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContent: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    minHeight: 48,
    width: '100%',
  },
  menuItemIcon: {
    width: 56,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.87)',
    paddingRight: 16,
  },
  menuItemDanger: {
    // Danger styling
  },
  menuItemDangerIcon: {
    color: 'rgba(211, 47, 47, 0.87)',
  },
  menuItemDangerText: {
    color: 'rgba(211, 47, 47, 0.87)',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 8,
  },
});

export default MenuContent;
