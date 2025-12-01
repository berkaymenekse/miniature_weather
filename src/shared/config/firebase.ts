/**
 * Firebase Configuration for React Native
 * Using @react-native-firebase native modules for optimal performance
 * 
 * IMPORTANT: Before using Firebase:
 * 1. Download google-services.json (Android) from Firebase Console
 * 2. Download GoogleService-Info.plist (iOS) from Firebase Console
 * 3. Place them in project root
 * 4. Run: npx expo prebuild --clean
 * 5. Set environment variables in .env file
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Check if Firebase is properly configured
// @react-native-firebase automatically uses google-services.json/GoogleService-Info.plist
let isFirebaseAvailable = false;

try {
  // Test if Firebase is initialized by attempting to access app
  const app = auth().app;
  if (app) {
    isFirebaseAvailable = true;
    console.log('[Firebase] Successfully initialized with @react-native-firebase');
    console.log('[Firebase] Project ID:', app.options.projectId);
  }
} catch (error) {
  console.warn('[Firebase] Not configured properly:', error);
  console.warn('[Firebase] Make sure to:');
  console.warn('  1. Add google-services.json (Android) and GoogleService-Info.plist (iOS)');
  console.warn('  2. Run: npx expo prebuild --clean');
  isFirebaseAvailable = false;
}

// Export Firebase services
const db = firestore();
const storageService = storage();
const authService = auth();

// Optional: Configure Firestore settings for better offline support
if (isFirebaseAvailable) {
  // Enable offline persistence
  firestore()
    .settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    })
    .catch((error) => {
      console.warn('[Firestore] Settings error:', error);
    });
}

export { db, storageService as storage, authService as auth, isFirebaseAvailable };
