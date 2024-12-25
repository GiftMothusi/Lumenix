import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { setUser, setToken, logout } from '../../store/slices/authSlice';
import auth from '@react-native-firebase/auth';
import { tokenManager } from './tokenManager';

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    username: string;
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
        createdAt: string;
        lastLogin: string;
    };
}

// Rate limiting configuration
const RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    attempts: new Map<string, { count: number; timestamp: number }>(),
};

// Helper function to check rate limiting
const checkRateLimit = (key: string): boolean => {
    const now = Date.now();
    const attempt = RATE_LIMIT.attempts.get(key);

    if (!attempt) {
        RATE_LIMIT.attempts.set(key, { count: 1, timestamp: now });
        return true;
    }

    if (now - attempt.timestamp > RATE_LIMIT.windowMs) {
        RATE_LIMIT.attempts.set(key, { count: 1, timestamp: now });
        return true;
    }

    if (attempt.count >= RATE_LIMIT.maxAttempts) {
        return false;
    }

    attempt.count += 1;
    return true;
};

// Helper function to store auth data
const storeAuthData = async (response: AuthResponse) => {
    await AsyncStorage.multiSet([
        ['auth_token', response.token],
        ['refresh_token', response.refreshToken],
    ]);
    store.dispatch(setToken(response.token));
    store.dispatch(setUser(response.user));
};

export const authAPI = {
    // Firebase token authentication
    loginWithFirebase: async (firebaseToken: string): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/firebase-login', {
                firebaseToken,
            });

            await storeAuthData(response.data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please try again.');
            }
            throw new Error('Server error. Please try again later.');
        }
    },

    // Login with email/password
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const key = `login:${credentials.email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many login attempts. Please try again later.');
        }

        try {
            // First authenticate with Firebase
            const userCredential = await auth().signInWithEmailAndPassword(
                credentials.email,
                credentials.password
            );

            // Get the Firebase token
            const firebaseToken = await userCredential.user.getIdToken();

            // Authenticate with backend
            const response = await authAPI.loginWithFirebase(firebaseToken);

            // Store authentication data
            await storeAuthData(response);

            return response;
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error('Invalid email or password');
            }
            if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many login attempts. Please try again later.');
            }
            if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your connection.');
            }
            throw new Error('Login failed. Please try again.');
        }
    },

    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const key = `register:${data.email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many registration attempts. Please try again later.');
        }

        try {
            // Create Firebase user
            const userCredential = await auth().createUserWithEmailAndPassword(
                data.email,
                data.password
            );

            // Get Firebase token
            const firebaseToken = await userCredential.user.getIdToken();

            // Register with backend
            const response = await apiClient.post<AuthResponse>('/auth/register', {
                ...data,
                firebaseToken,
            });

            // Store authentication data
            await storeAuthData(response.data);

            return response.data;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Email is already registered');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak');
            }
            if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your connection.');
            }
            throw new Error('Registration failed. Please try again.');
        }
    },

    // Logout
    logout: async () => {
        try {
            // Sign out from Firebase
            await auth().signOut();

            // Call logout endpoint to invalidate token
            await apiClient.post('/auth/logout');

            // Clear local storage
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);

            // Update Redux state
            store.dispatch(logout());
        } catch (error) {
            console.error('Error during logout:', error);
            // Force logout even if server call fails
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
            store.dispatch(logout());
        }
    },

    // Verify token
    verifyToken: async (): Promise<boolean> => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (!token){
                return false;
            }

            // Check token validity
            const isValid = await tokenManager.validateToken(token);
            if (!isValid) {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken){
                    return false;
                }

                // Attempt to refresh token
                await tokenManager.getNewToken(refreshToken);
            }

            return true;
        } catch (error) {
            return false;
        }
    },

    // Update password
    updatePassword: async (data: UpdatePasswordData): Promise<void> => {
        try {
            const user = auth().currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Update password in Firebase
            await user.updatePassword(data.newPassword);

            // Update password in backend
            await apiClient.post('/auth/update-password', data);
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('Please log in again before updating your password');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak');
            }
            throw new Error('Failed to update password. Please try again.');
        }
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<void> => {
        const key = `forgotPassword:${email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many password reset attempts. Please try again later.');
        }

        try {
            // Send reset email through Firebase
            await auth().sendPasswordResetEmail(email);

            // Notify backend
            await apiClient.post('/auth/forgot-password', { email });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Don't reveal if email exists for security
                return;
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address');
            }
            throw new Error('Failed to send password reset email. Please try again.');
        }
    },
};
