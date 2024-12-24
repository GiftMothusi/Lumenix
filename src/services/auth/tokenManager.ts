import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { NavigationService } from '../../navigation/navigationService';
import config from '../../config';

interface TokenData {
    exp: number;
    iat: number;
    uid: string;
}

export class TokenManager {
    private static instance: TokenManager;
    private refreshPromise: Promise<string> | null = null;
    private readonly storage = AsyncStorage;

    private constructor() {}

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    async getNewToken(refreshToken: string): Promise<string> {
        // If a refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        // Create new refresh promise with proper error handling
        this.refreshPromise = (async () => {
            try {
                const response = await axios.post(
                    `${config.apiUrl}/auth/refresh-token`,
                    { refreshToken }
                );

                const newToken = response.data.token;
                await this.storage.setItem('auth_token', newToken);

                return newToken;
            } catch (error) {
                console.error('Token refresh failed:', error);
                await this.handleTokenError();
                throw new Error('Failed to refresh authentication token');
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const tokenData = this.parseToken(token);
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Check if token is expired or close to expiring (within refresh threshold)
            return currentTime < (expirationTime - config.authConfig.refreshThreshold);
        } catch {
            return false;
        }
    }

    private parseToken(token: string): TokenData {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (error) {
            throw new Error('Invalid token format');
        }
    }

    private async handleTokenError(): Promise<void> {
        try {
            await this.storage.multiRemove(['auth_token', 'refresh_token']);
            store.dispatch(logout());
            NavigationService.navigateToAuth();
        } catch (error) {
            console.error('Error during token error handling:', error);
            // Ensure logout even if token removal fails
            store.dispatch(logout());
            NavigationService.navigateToAuth();
        }
    }
}

export const tokenManager = TokenManager.getInstance();
