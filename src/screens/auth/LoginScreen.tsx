import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { authAPI } from '../../services/auth/auth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useAppDispatch } from '../../store/hooks';
import { NavigationService } from '../../navigation/navigationService';
import {
  loginSuccess,
  setError as setAuthError,
  setLoading as setAuthLoading,
} from '../../store/slices/authSlice';

// Define the props type using StackScreenProps for type-safe navigation
type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  // Initialize Redux dispatch
  const dispatch = useAppDispatch();

  // Local state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle the login process
  const handleLogin = async () => {
    // Form validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password should be at least 6 characters long');
      return;
    }

    try {
      // Set loading states both locally and in Redux
      setLoading(true);
      setError('');
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      // Attempt login through the auth service
      const response = await authAPI.login({ email, password });

      // Update global state with successful login data
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));

      // Navigate to main app on successful login
      NavigationService.navigateToMainApp();
    } catch (err) {
      // Handle errors and update both local and global error states
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please try again.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    } finally {
      // Clear loading states regardless of outcome
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>

          {/* Email Input */}
          <TextInput
            style={[styles.input, error && email === '' && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(''); // Clear error when user starts typing
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            placeholderTextColor="#666"
            testID="login-email-input"
          />

          {/* Password Input */}
          <TextInput
            style={[styles.input, error && password === '' && styles.inputError]}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(''); // Clear error when user starts typing
            }}
            secureTextEntry
            editable={!loading}
            placeholderTextColor="#666"
            testID="login-password-input"
          />

          {/* Error Message Display */}
          {error ? (
            <Text style={styles.errorText} testID="login-error-message">
              {error}
            </Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            testID="login-submit-button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
            disabled={loading}
            testID="forgot-password-link"
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Register Account Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              testID="register-link"
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#ff0000',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;
