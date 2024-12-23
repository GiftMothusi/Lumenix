import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types/navigation';
import { store } from '../store';
import { navigationRef } from './navigationService';
import { setToken } from '../store/slices/authSlice';

// Auth Screen
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


const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// Main app navigator
const MainTabNavigator = () => (
    <MainTab.Navigator>
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
      {/* Add other main app screens */}
    </MainTab.Navigator>
  );

// Root component with Redux Provider
export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    const checkAuth = async () => {

        try{
            const storedToken = await AsyncStorage.getItem('auth_token');
            if(storedToken){
                dispatch(setToken(storedToken));
                //TODO: verify token with my API
            }
        }catch(err){
            console.error('Failed to retrieve token from AsyncStorage:', err);
            await AsyncStorage.removeItem('auth_token');
            dispatch(setToken(null));
        }
    };
    checkAuth();
  },[dispatch]);

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
            // Auth flows when user is not logged in
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // Main app flows when user is logged in
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
