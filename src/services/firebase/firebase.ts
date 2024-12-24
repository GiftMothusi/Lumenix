import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import '@react-native-firebase/storage';


const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};


const firebaseConfig = {
    apiKey: getEnvVariable('REACT_APP_API_KEY'),
    authDomain: getEnvVariable('REACT_APP_AUTH_DOMAIN'),
    databaseURL: getEnvVariable('REACT_APP_DATABASE_URL'),
    projectId: getEnvVariable('REACT_APP_PROJECT_ID'),
    storageBucket: getEnvVariable('REACT_APP_STORAGE_BUCKET'),
    messagingSenderId: getEnvVariable('REACT_APP_MESSAGING_SENDER_ID'),
    appId: getEnvVariable('REACT_APP_APP_ID'),
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
