import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { NavigationService } from '../../navigation/navigationService';
import { tokenManager } from '../auth/tokenManager';
import config from '../../config';

interface QueueItem {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

export const apiClient = axios.create({
    baseURL: config.apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        
        if (token && config.headers) {
            try {
                const isValid = await tokenManager.validateToken(token);
                
                if (!isValid) {
                    const refreshToken = await AsyncStorage.getItem('refresh_token');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const newToken = await tokenManager.getNewToken(refreshToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                // Token refresh failed, redirect to auth
                await handleTokenError();
                throw error;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const newToken = await tokenManager.getNewToken(refreshToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                processQueue();
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                await handleTokenError();
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to perform this action');
        }

        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later');
        }

        if (!error.response) {
            throw new Error('Network error. Please check your connection');
        }

        return Promise.reject(error);
    }
);

async function handleTokenError(): Promise<void> {
    try {
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        store.dispatch(logout());
        NavigationService.navigateToAuth();
    } catch (error) {
        console.error('Error during token error handling:', error);
        store.dispatch(logout());
        NavigationService.navigateToAuth();
    }
}

export default apiClient;
