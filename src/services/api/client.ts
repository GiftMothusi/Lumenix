import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//My actual API URL
const BASE_URL = '';

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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized acess
            await AsyncStorage.removeItem('auth_token');
            throw new Error('Unauthorized');
        }
        return Promise.reject(error);
    }
);



