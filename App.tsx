import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { authSynchronizer } from './src/services/auth/authSync';


const App = () => {
    useEffect(() => {
        // Initialize auth synchronization
        const initializeAuth = async () => {
            try {
                await authSynchronizer.startSync();
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            }
        };

        initializeAuth();

        // Cleanup on unmount
        return () => {
            authSynchronizer.stopSync();
        };
    }, []);

    return (
        <Provider store={store}>
            <RootNavigator />
        </Provider>
    );
};

export default App;
