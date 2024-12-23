import { NavigationContainerRef, StackActions } from '@react-navigation/native';
import * as React from 'react';
import { RootStackParamList } from '../types/navigation';


export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export const NavigationService = {
    navigate: (name: keyof RootStackParamList, params?: any) => {
        navigationRef.current?.navigate(name, params);
    },

    goBack: () => {
        navigationRef.current?.goBack();
    },

    push: (name: keyof RootStackParamList, params?: any) => {
        navigationRef.current?.dispatch(StackActions.push(name, params));
    },

    pop: (count: number = 1) => {
        navigationRef.current?.dispatch(StackActions.pop(count));
    },

    popToTop: () => {
        navigationRef.current?.dispatch(StackActions.popToTop());
    },

    replace: (name: keyof RootStackParamList, params?: any) => {
        navigationRef.current?.dispatch(StackActions.replace(name, params));
    },

    reset: (routeName: keyof RootStackParamList) => {
        navigationRef.current?.reset({
            index: 0,
            routes: [{ name: routeName}],
        });
    },

    navigateToMainApp: () => {
        navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
        });
    },

    navigateToAuth: () => {
        navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
        });
    },
};
