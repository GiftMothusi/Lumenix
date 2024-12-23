import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { NavigationService } from '../../navigation/navigationService';

//My actual API URL
const BASE_URL = 'http://localhost:3000/api';

interface QueueItem {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

const REFRESH_TOKEN_THRESHOLD = 5 * 60 * 1000;
let isRefreshing = false;
let failedQueue: QueueItem[] = [];


const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if(error){
            prom.reject(error);
        }else{
            prom.resolve();
        }
    });
    failedQueue = [];
};

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token && config.headers) {
            try{
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const expirationTime = tokenData.exp * 1000;
                const currentTime = Date.now();

                if(currentTime >= expirationTime){
                    throw new Error('Token expired');
                }

                if(expirationTime - currentTime < REFRESH_TOKEN_THRESHOLD){
                    const refreshToken = await AsyncStorage.getItem('refresh_token');
                    if(refreshToken){
                        const newToken = await refreshAuthToken(refreshToken);
                        config.headers.Authorization = `Bearer ${newToken}`;
                        return config;
                    }
                }
            }catch(error){
                await handleTokenError();
                throw error;
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If refreshing, queue the failed request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            if (originalRequest) {
                originalRequest._retry = true;
            }
            isRefreshing = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                const newToken = await refreshAuthToken(refreshToken);

                if (originalRequest && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

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

        // Handle other error status codes
        if (error.response?.status === 403) {
            throw new Error('You do not have permission to perform this action');
        }

        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later');
        }

        // Network errors
        if (!error.response) {
            throw new Error('Network error. Please check your connection');
        }

        return Promise.reject(error);
    }
);


async function refreshAuthToken(refreshToken: string): Promise<string> {
    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
        });
        const newToken = response.data.token;
        await AsyncStorage.setItem('auth_token', newToken);
        return newToken;
    } catch (error) {
        throw new Error('Failed to refresh token');
    }
}


async function handleTokenError(): Promise<void> {
    try {
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        store.dispatch(logout());
        NavigationService.navigateToAuth();
    } catch (error) {
        console.error('Error during token error handling:', error);
        // Ensure logout and navigation even if token removal fails
        store.dispatch(logout());
        NavigationService.navigateToAuth();
    }
}

export default apiClient;





