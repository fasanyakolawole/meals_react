import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/slices/authSlice';
import { selectHasAddress } from '../store/slices/authSlice';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const hasAddress = useSelector(selectHasAddress);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Naija Meals!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>You are successfully logged in!</Text>
        <Text style={styles.text}>
          {hasAddress ? 'You have an address on file.' : "You don't have an address yet."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    color: '#10b981',
    fontSize: 32,
  },
  logoutButton: {
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#dc3545',
    borderRadius: 0,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    fontSize: 18,
    color: '#1a202c',
    lineHeight: 28,
  },
  text: {
    fontSize: 18,
    color: '#1a202c',
    marginBottom: 12,
  },
});

export default DashboardScreen;
