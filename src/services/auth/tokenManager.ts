import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { store } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { NavigationService } from '../../navigation/navigationService';
import config from '../../config';
import auth from '@react-native-firebase/auth';

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
                // First, check Firebase token
                const currentUser = auth().currentUser;
                if (!currentUser) {
                    throw new Error('No authenticated user');
                }

                // Get new Firebase token
                const firebaseToken = await currentUser.getIdToken(true);

                // Exchange Firebase token for new app tokens
                const response = await axios.post(
                    `${config.apiUrl}/auth/refresh-token`,
                    {
                        refreshToken,
                        firebaseToken,
                    }
                );

                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                await this.storage.multiSet([
                    ['auth_token', newToken],
                    ['refresh_token', newRefreshToken],
                ]);

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
            const refreshThreshold = config.authConfig.refreshThreshold;

            // Check if token is expired or close to expiring
            if (currentTime >= (expirationTime - refreshThreshold)) {
                // Token needs refresh
                return false;
            }

            // Also verify with Firebase
            const currentUser = auth().currentUser;
            if (!currentUser) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    private parseToken(token: string): TokenData {
        try {
            const payload = token.split('.')[1];
            const decoded = Buffer.from(payload, 'base64').toString('utf8');
            return JSON.parse(decoded);
        } catch (error) {
            throw new Error('Invalid token format');
        }
    }

    private async handleTokenError(): Promise<void> {
        try {
            // Sign out from Firebase
            await auth().signOut();

            // Clear stored tokens
            await this.storage.multiRemove(['auth_token', 'refresh_token']);

            // Update Redux state
            store.dispatch(logout());

            // Navigate to auth
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
