import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../store/slices/drawerSlice';

const MenuButton = () => {
  const dispatch = useDispatch();

  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => dispatch(toggleDrawer())}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '400',
  },
});

export default MenuButton;
