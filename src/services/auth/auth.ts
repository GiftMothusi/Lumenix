import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { setUser, setToken, logout } from '../../store/slices/authSlice';

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

export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const key = `login:${credentials.email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many login attempts. Please try again later.');
        }

        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
            const { token, refreshToken, user } = response.data;

            // Store tokens
            await AsyncStorage.multiSet([
                ['auth_token', token],
                ['refresh_token', refreshToken],
            ]);

            // Update Redux state
            store.dispatch(setToken(token));
            store.dispatch(setUser(user));

            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Invalid credentials');
            }
            throw error;
        }
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const key = `register:${data.email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many registration attempts. Please try again later.');
        }

        try {
            const response = await apiClient.post<AuthResponse>('/auth/register', data);
            const { token, refreshToken, user } = response.data;

            // Store tokens
            await AsyncStorage.multiSet([
                ['auth_token', token],
                ['refresh_token', refreshToken],
            ]);

            // Update Redux state
            store.dispatch(setToken(token));
            store.dispatch(setUser(user));

            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('Email already registered');
            }
            throw error;
        }
    },

    logout: async () => {
        try {
            // Call logout endpoint to invalidate token on server
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Continue with local logout even if server request fails
            console.error('Error during server logout:', error);
        } finally {
            // Clear local storage
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
            // Update Redux state
            store.dispatch(logout());
        }
    },

    verifyToken: async (): Promise<boolean> => {
        try {
            const response = await apiClient.post<{ valid: boolean }>('/auth/verify-token');
            return response.data.valid;
        } catch (error) {
            return false;
        }
    },

    updatePassword: async (data: UpdatePasswordData): Promise<void> => {
        const response = await apiClient.post('/auth/update-password', data);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<void> => {
        const key = `forgotPassword:${email}`;
        if (!checkRateLimit(key)) {
            throw new Error('Too many password reset attempts. Please try again later.');
        }

        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        const response = await apiClient.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    validateResetToken: async (token: string): Promise<boolean> => {
        try {
            const response = await apiClient.post<{ valid: boolean }>('/auth/validate-reset-token', { token });
            return response.data.valid;
        } catch (error) {
            return false;
        }
    },
};
