import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { RootStackParamList, AuthStackParamList } from '../types/navigation';
import { store } from '../store';

// Auth Screen
import LoginScreen from '../screens/auth/LoginScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

// Root component with Redux Provider
export const RootNavigator = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};