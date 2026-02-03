import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetForm, setResetForm] = useState({
    code: '',
    password: '',
    confirm_password: '',
  });

  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const isPasswordValid = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasUppercase && hasSpecial;
  };

  const passwordsMatch = resetForm.password === resetForm.confirm_password;
  const isResetFormValid = resetForm.code && isPasswordValid(resetForm.password) && resetForm.confirm_password && passwordsMatch;

  const sendResetLink = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await api.post('/auth/send_reset_link', { email });
      setShowResetForm(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset link. Please try again.';
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!isResetFormValid) return;
    
    setLoading(true);
    try {
      await api.post('/auth/reset', {
        email,
        ...resetForm,
      });
      
      Alert.alert('Success', 'Password has been reset successfully');
      navigation.navigate('Login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password. Please check your code and try again.';
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Naija Meals</Text>
            <Text style={styles.tagline}>
              Experience the rich flavors of Nigeria delivered fresh to your doorstep. Authentic Nigerian Cuisine
            </Text>
          </View>
          <View style={styles.welcomeMessage}>
            <Text style={styles.welcomeText}>Reset Password</Text>
          </View>
        </View>

        <View style={styles.form}>
          {!showResetForm ? (
            <>
              <Text style={styles.instructionText}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, email && !isValidEmail(email) && styles.inputInvalid]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => setEmailTouched(true)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {emailTouched && email && !isValidEmail(email) && (
                  <Text style={styles.errorText}>Please enter a valid email address</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, (loading || !email || !isValidEmail(email)) && styles.buttonDisabled]}
                onPress={sendResetLink}
                disabled={loading || !email || !isValidEmail(email)}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Verification Code From Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. F06-E362-4"
                  value={resetForm.code}
                  onChangeText={(text) => setResetForm({ ...resetForm, code: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, resetForm.password && !isPasswordValid(resetForm.password) && styles.inputInvalid]}
                  placeholder="Min 8 chars, 1 uppercase, 1 special"
                  value={resetForm.password}
                  onChangeText={(text) => setResetForm({ ...resetForm, password: text })}
                  secureTextEntry
                  editable={!loading}
                />
                {resetForm.password && !isPasswordValid(resetForm.password) && (
                  <Text style={styles.errorText}>
                    Must be 8+ chars with 1 uppercase and 1 special character
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, resetForm.confirm_password && !passwordsMatch && styles.inputInvalid]}
                  placeholder="Confirm new password"
                  value={resetForm.confirm_password}
                  onChangeText={(text) => setResetForm({ ...resetForm, confirm_password: text })}
                  secureTextEntry
                  editable={!loading}
                />
                {resetForm.confirm_password && !passwordsMatch && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, (loading || !isResetFormValid) && styles.buttonDisabled]}
                onPress={submitNewPassword}
                disabled={loading || !isResetFormValid}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.authToggle}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.toggleLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  contentContainer: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#EF712E',
    padding: 14,
    paddingTop: 28,
    gap: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  logoContainer: {
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '400',
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.87)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  welcomeMessage: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.87)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 24,
  },
  instructionText: {
    marginBottom: 24,
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.38)',
    fontSize: 16,
    backgroundColor: 'rgba(56, 142, 60, 0.04)',
    minHeight: 56,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  inputInvalid: {
    borderBottomColor: '#BA1A1A',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#BA1A1A',
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#EF712E',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  authToggle: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleLink: {
    color: '#EF712E',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default ForgotPasswordScreen;
