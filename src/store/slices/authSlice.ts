import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    lastLogin: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    lastLoginTime: number | null;
    loginAttempts: number;
    lastAttemptTime: number | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    lastLoginTime: null,
    loginAttempts: 0,
    lastAttemptTime: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            if (action.payload) {
                state.isLoading = false;
            }
        },

        loginAttempt: (state) => {
            state.loginAttempts += 1;
            state.lastAttemptTime = Date.now();
            state.error = null;
        },

        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.lastLoginTime = Date.now();
            state.loginAttempts = 0;
            state.lastAttemptTime = null;
            state.error = null;
            state.isLoading = false;
        },

        loginFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
            // Increment login attempts but keep track of them
            if (state.lastAttemptTime && Date.now() - state.lastAttemptTime > 15 * 60 * 1000) {
                // Reset attempts if last attempt was more than 15 minutes ago
                state.loginAttempts = 1;
            } else {
                state.loginAttempts += 1;
            }
            state.lastAttemptTime = Date.now();
        },

        sessionExpired: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = 'Session expired. Please login again.';
            state.lastLoginTime = null;
            // Don't reset login attempts here as they should persist across sessions
        },

        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { 
                    ...state.user, 
                    ...action.payload,
                    // Preserve these fields from the original user object
                    id: state.user.id,
                    createdAt: state.user.createdAt,
                    lastLogin: state.user.lastLogin
                };
            }
        },

        clearErrors: (state) => {
            state.error = null;
        },

        logout: () => {
            // Return a fresh copy of initial state to ensure complete reset
            return { ...initialState };
        },
    },
});

// Type-safe selectors
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;
export const selectUser = (state: RootState): User | null => state.auth.user;
export const selectAuthError = (state: RootState): string | null => state.auth.error;
export const selectIsLoading = (state: RootState): boolean => state.auth.isLoading;
export const selectLoginAttempts = (state: RootState): number => state.auth.loginAttempts;
export const selectLastLoginTime = (state: RootState): number | null => state.auth.lastLoginTime;

// Export actions
export const {
    setUser,
    setToken,
    setLoading,
    setError,
    loginAttempt,
    loginSuccess,
    loginFailure,
    sessionExpired,
    updateUserProfile,
    clearErrors,
    logout,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
