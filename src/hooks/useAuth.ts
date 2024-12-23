import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { authAPI } from '../services/auth/auth';
import {  loginSuccess,
    loginFailure,
    clearErrors,
    setLoading,
    logout,
} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationService } from '../navigation/navigationService';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const [isInitialized, setIsInitialized] = useState(false);

    // Select the entire authentication state from Redux
    const authState = useAppSelector((state) => state.auth);

    // Authentication initialization on app startup
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                dispatch(setLoading(true));

                // Retrieve stored authentication token
                const token = await AsyncStorage.getItem('auth_token');

                if (token) {
                    // Verify the existing token's validity
                    const isValid = await authAPI.verifyToken();

                    if (!isValid) {
                        // If token is invalid, perform logout
                        await authAPI.logout();
                    }
                }
            } catch (error) {
                console.error('Authentication initialization error', error);

                // Dispatch logout to reset authentication state
                dispatch(logout());
            } finally {
                dispatch(setLoading(false));
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [dispatch]);

    // Login method with comprehensive error handling and state management
    const handleLogin = useCallback(async (email: string, password: string) => {
        try {
            // Set loading state and clear previous errors
            dispatch(setLoading(true));
            dispatch(clearErrors());

            // Attempt login through API
            const response = await authAPI.login({ email, password });

            // Update Redux store with user and token
            dispatch(loginSuccess({
                user: response.user,
                token: response.token}));
            // Navigate to main application
            NavigationService.navigateToMainApp();
            return true;
        } catch (error) {
            // Generate user-friendly error message
            const errorMessage = error instanceof Error
                ? error.message
                : 'Login failed';

            // Dispatch login failure to update error state
            dispatch(loginFailure(errorMessage));
            return false;
        } finally {
            // Ensure loading state is reset
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // Registration method with similar comprehensive handling
    const handleRegister = useCallback(async (username: string, email: string, password: string) => {
        try {
            // Set loading state and clear previous errors
            dispatch(setLoading(true));
            dispatch(clearErrors());

            // Attempt registration through API
            const response = await authAPI.register({ username, email, password });

            // Update Redux store with user and token
            dispatch(loginSuccess({
                user: response.user,
                token: response.token}));

            // Navigate to main application
            NavigationService.navigateToMainApp();
            return true;
        } catch (error) {
            // Generate user-friendly error message
            const errorMessage = error instanceof Error
                ? error.message
                : 'Registration failed';

            // Dispatch login failure to update error state
            dispatch(loginFailure(errorMessage));
            return false;
        } finally {
            // Ensure loading state is reset
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // Logout method with proper state management
    const handleLogout = useCallback(async () => {
        try {
            // Set loading state
            dispatch(setLoading(true));

            // Perform logout through API
            await authAPI.logout();

            // Navigate back to authentication screen
            NavigationService.navigateToAuth();
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            // Ensure loading state is reset
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // Return authentication state and methods
    return {
        ...authState,
        isInitialized,
        handleLogin,
        handleRegister,
        handleLogout,
    };
};

export default useAuth;
