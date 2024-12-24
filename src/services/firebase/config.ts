import auth from '@react-native-firebase/auth';

export const firebaseAuth = auth();

export const initializeFirebase = async () => {
  try {
    await auth().signInAnonymously();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};
