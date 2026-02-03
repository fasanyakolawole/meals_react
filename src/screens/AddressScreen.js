import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveAddress } from '../store/slices/authSlice';
import api from '../services/api';

const AddressScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    mobileContact: '',
    postcode: '',
    address: '',
    deliveryInstructions: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [postcodeInvalid, setPostcodeInvalid] = useState(false);
  const [postcodeLookupAttempted, setPostcodeLookupAttempted] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetchCurrentAddress();
  }, []);

  // Set selected address index when addresses are loaded and form.address is set
  useEffect(() => {
    if (form.address && addressSuggestions.length > 0) {
      const addressIndex = addressSuggestions.findIndex(s => s.address === form.address);
      if (addressIndex >= 0 && selectedAddressIndex !== addressIndex + 1) {
        setSelectedAddressIndex(addressIndex + 1);
      }
    }
  }, [addressSuggestions, form.address]);

  const fetchCurrentAddress = async () => {
    try {
      const response = await api.get('/auth/client/address');
      const data = response.data;
      
      if (data.fullName) setForm(prev => ({ ...prev, fullName: String(data.fullName) }));
      if (data.mobileContact) setForm(prev => ({ ...prev, mobileContact: String(data.mobileContact) }));
      if (data.postcode) {
        setForm(prev => ({ ...prev, postcode: String(data.postcode) }));
        const postcode = String(data.postcode).trim();
        if (isValidPostcode(postcode)) {
          await lookupAddresses(postcode.replace(/\s+/g, ''));
        }
      }
      if (data.address) {
        setForm(prev => ({ ...prev, address: String(data.address) }));
      }
      if (data.deliveryInstructions) setForm(prev => ({ ...prev, deliveryInstructions: String(data.deliveryInstructions) }));
    } catch (error) {
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load current address.';
        Alert.alert('Load Address Failed', errorMessage);
      }
    }
  };

  const isValidPostcode = (postcode) => {
    if (!postcode) return false;
    const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    const cleanPostcode = postcode.replace(/\s+/g, '');
    if (cleanPostcode.length < 5 || cleanPostcode.length > 8) return false;
    return ukPostcodePattern.test(postcode);
  };

  const onPostcodeChange = (text) => {
    setForm(prev => ({ ...prev, postcode: text, address: '' }));
    setAddressSuggestions([]);
    setSelectedAddressIndex(-1);
    setPostcodeLookupAttempted(false);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      const postcode = text.trim();
      
      if (!postcode || postcode.length < 3) {
        setPostcodeInvalid(false);
        setAddressSuggestions([]);
        setPostcodeLookupAttempted(false);
        return;
      }
      
      if (isValidPostcode(postcode)) {
        setPostcodeInvalid(false);
        await lookupAddresses(postcode);
      } else {
        setPostcodeInvalid(true);
        setAddressSuggestions([]);
        setPostcodeLookupAttempted(true);
        setSelectedAddressIndex(-1);
      }
    }, 500);
  };

  const lookupAddresses = async (postcode) => {
    setLoadingAddresses(true);
    setPostcodeLookupAttempted(true);
    setAddressSuggestions([]);
    setSelectedAddressIndex(-1);
    
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '');
      const response = await api.get(`/auth/client/address/lookUp/${cleanPostcode}`);
      
      if (response.data && response.data.suggestions) {
        setAddressSuggestions(response.data.suggestions);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to lookup addresses:', error);
      setAddressSuggestions([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const onAddressSelect = (itemValue, itemIndex) => {
    if (itemIndex > 0 && addressSuggestions[itemIndex - 1]) {
      const selectedAddress = addressSuggestions[itemIndex - 1].address;
      setForm(prev => ({ ...prev, address: selectedAddress }));
      setSelectedAddressIndex(itemIndex);
    } else {
      setForm(prev => ({ ...prev, address: '' }));
      setSelectedAddressIndex(-1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      await dispatch(saveAddress({
        fullName: form.fullName,
        mobileContact: form.mobileContact,
        postcode: form.postcode,
        address: form.address,
        deliveryInstructions: form.deliveryInstructions,
      })).unwrap();
      
      navigation.goBack();
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to save address. Please try again.';
      Alert.alert('Save Address Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Delivery Details</Text>
          <Text style={styles.headerSubtitle}>Please provide your delivery address to continue</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Postcode</Text>
            <TextInput
              style={[styles.input, postcodeInvalid && form.postcode && styles.inputInvalid]}
              placeholder="e.g. SW1A 1AA or M1 1AA"
              value={form.postcode}
              onChangeText={onPostcodeChange}
              editable={!loading && !loadingAddresses}
              underlineColorAndroid={postcodeInvalid && form.postcode ? '#BA1A1A' : '#388E3C'}
            />
            {loadingAddresses && <Text style={styles.loadingText}>Loading addresses...</Text>}
            {postcodeInvalid && form.postcode && !loadingAddresses && (
              <Text style={styles.errorText}>
                Please enter a valid UK postcode (e.g. SW1A 1AA or M1 1AA)
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Address</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAddressIndex >= 0 ? selectedAddressIndex : ''}
                onValueChange={onAddressSelect}
                style={styles.picker}
                dropdownIconColor="#388E3C"
                enabled={!loading && addressSuggestions.length > 0}
              >
                <Picker.Item 
                  label={addressSuggestions.length > 0 ? "Select an address..." : "Enter postcode first"} 
                  value="" 
                  color={addressSuggestions.length > 0 ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.38)'}
                />
                {addressSuggestions.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={item.address}
                    value={index + 1}
                    color="rgba(0, 0, 0, 0.87)"
                  />
                ))}
              </Picker>
            </View>
            {!loadingAddresses && addressSuggestions.length === 0 && form.postcode && postcodeLookupAttempted && (
              <Text style={styles.errorText}>No addresses found for this postcode</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={form.fullName}
              onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
              editable={!loading}
              underlineColorAndroid="#388E3C"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              value={form.mobileContact}
              onChangeText={(text) => setForm(prev => ({ ...prev, mobileContact: text }))}
              keyboardType="phone-pad"
              editable={!loading}
              underlineColorAndroid="#388E3C"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Delivery Instructions</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter delivery instructions (optional)"
              value={form.deliveryInstructions}
              onChangeText={(text) => setForm(prev => ({ ...prev, deliveryInstructions: text }))}
              editable={!loading}
              underlineColorAndroid="#388E3C"
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    gap: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    width: '100%',
    padding: 8,
    paddingBottom: 4,
    fontSize: 16,
    backgroundColor: 'transparent',
    minHeight: 48,
    color: 'rgba(0, 0, 0, 0.87)',
    ...(Platform.OS === 'android' && {
      borderBottomWidth: 0,
      borderBottomColor: 'transparent',
    }),
  },
  inputInvalid: {
    borderBottomColor: '#BA1A1A',
  },
  addressInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  pickerContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.42)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 0,
    minHeight: 56,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 56,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  loadingText: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#BA1A1A',
  },
  submitButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: 'auto',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default AddressScreen;
