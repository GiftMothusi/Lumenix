// src/services/auth/authSync.ts

import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { setUser, setToken, logout } from '../../store/slices/authSlice';
import { authAPI } from './auth';
import { NavigationService } from '../../navigation/navigationService';

class AuthSynchronizer {
    private static instance: AuthSynchronizer;
    private unsubscribe: (() => void) | null = null;
    private isInitialized = false;

    private constructor() {}

    static getInstance(): AuthSynchronizer {
        if (!AuthSynchronizer.instance) {
            AuthSynchronizer.instance = new AuthSynchronizer();
        }
        return AuthSynchronizer.instance;
    }

    async startSync(): Promise<void> {
        // Prevent multiple initializations
        if (this.isInitialized) {
            return;
        }

        // Stop any existing sync
        this.stopSync();

        try {
            // Check for existing auth state first
            const storedToken = await AsyncStorage.getItem('auth_token');
            if (storedToken) {
                const firebaseUser = auth().currentUser;
                if (!firebaseUser) {
                    // Local token exists but no Firebase user - clear local auth
                    await this.handleSyncError();
                }
            }

            // Set up Firebase auth state listener
            this.unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
                if (firebaseUser) {
                    try {
                        // Get Firebase ID token
                        const firebaseToken = await firebaseUser.getIdToken();

                        // Exchange Firebase token for app token through login
                        const authResponse = await authAPI.loginWithFirebase(firebaseToken);

                        // Store tokens
                        await AsyncStorage.multiSet([
                            ['auth_token', authResponse.token],
                            ['refresh_token', authResponse.refreshToken],
                        ]);

                        // Update Redux state
                        store.dispatch(setToken(authResponse.token));
                        store.dispatch(setUser(authResponse.user));

                        // Navigate to main app if not already there
                        NavigationService.navigateToMainApp();
                    } catch (error) {
                        console.error('Auth sync error:', error);
                        await this.handleSyncError();
                    }
                } else {
                    await this.handleSyncError();
                }
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to start auth sync:', error);
            await this.handleSyncError();
        }
    }

    stopSync(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.isInitialized = false;
    }

    private async handleSyncError(): Promise<void> {
        try {
            // Clear local auth state
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
            store.dispatch(logout());
            NavigationService.navigateToAuth();
        } catch (error) {
            console.error('Error during sync error handling:', error);
            // Ensure logout even if token removal fails
            store.dispatch(logout());
            NavigationService.navigateToAuth();
        }
    }
}

export const authSynchronizer = AuthSynchronizer.getInstance();
