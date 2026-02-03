import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsDrawerOpen } from '../store/slices/drawerSlice';
import { closeDrawer } from '../store/slices/drawerSlice';
import MenuContent from './MenuContent';

const SlideDrawer = ({ title = 'Menu' }) => {
  const isOpen = useSelector(selectIsDrawerOpen);
  const dispatch = useDispatch();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={() => dispatch(closeDrawer())}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => dispatch(closeDrawer())}
      >
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>{title}</Text>
            <TouchableOpacity onPress={() => dispatch(closeDrawer())}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <MenuContent />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    flexDirection: 'row',
  },
  drawer: {
    width: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  drawerHeader: {
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  closeButton: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.54)',
  },
});

export default SlideDrawer;
