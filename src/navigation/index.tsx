import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types/navigation';
import { store } from '../store';
import { navigationRef } from './navigationService';
import { setToken } from '../store/slices/authSlice';

// Import Firebase
import auth from '@react-native-firebase/auth';

// Import your existing screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import UpdatePasswordScreen from '../screens/auth/UpdatePasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import { useAppSelector, useAppDispatch } from '../store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Your existing navigator components remain the same
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabNavigator = () => (
  <MainTab.Navigator>
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Profile" component={ProfileScreen} />
  </MainTab.Navigator>
);

// Modified Root component with Firebase auth state handling
export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Get the token when user is authenticated
        const token = await user.getIdToken();
        await AsyncStorage.setItem('auth_token', token);
        dispatch(setToken(token));
      } else {
        await AsyncStorage.removeItem('auth_token');
        dispatch(setToken(null));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!token ? (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <>
              <RootStack.Screen name="MainApp" component={MainTabNavigator} />
              <RootStack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};
