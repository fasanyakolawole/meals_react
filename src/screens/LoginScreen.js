import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { login, register } from '../store/slices/authSlice';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    if (isLoginMode) {
      setForm({ ...form, firstName: '', lastName: '' });
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await dispatch(login({
        email: form.email,
        password: form.password,
      })).unwrap();

      if (!result.hasAddress) {
        navigation.replace('Address');
      } else {
        navigation.replace('Restaurants');
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Login failed';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await dispatch(register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })).unwrap();

      if (!result.hasAddress) {
        navigation.replace('Address');
      } else {
        navigation.replace('Restaurants');
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.welcome}>
            <View style={{flexDirection:"column"}}>
              <Text style={{fontSize: 30}}>Welcome Back </Text>
              <Text style={{fontSize: 15}}>Please sign in to continue </Text>
            </View>
            <Image
                source={require('../../assets/hnd.jpeg')}
                style={{width:70, height:50}}
                resizeMode="contain"
            />
          </View>
          
        <View style={styles.form}>
          {!isLoginMode && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  value={form.firstName}
                  onChangeText={(text) => setForm({ ...form, firstName: text })}
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  value={form.lastName}
                  onChangeText={(text) => setForm({ ...form, lastName: text })}
                  editable={!loading}
                />
              </View>
            </>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {isLoginMode && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLoginMode ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLoginMode ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.authToggle}>
            <Text style={styles.toggleText}>
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={loading}>
              <Text style={styles.toggleLink}>
                {isLoginMode ? 'Register' : 'Login'}
              </Text>
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
    marginTop: 100,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#EF712E',
    padding: 14,
    paddingTop: 28,
    gap: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  logoContainer: {
    gap: 12,
  },
  welcome: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 24
  },
  title: {
    color: '#EF712E',
    fontSize: 32,
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
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 24,
  },

  formGroup: {
    marginBottom: 20,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197,91,15,0.42)',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    minHeight: 56,
    color: 'rgba(186,85,13,0.65)',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#EF712E',
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  toggleLink: {
    color: '#EF712E',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default LoginScreen;
