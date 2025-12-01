import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseAvailable } from '@/shared/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedImage {
  url: string;
  createdAt: Timestamp;
  city: string;
  condition: string;
}

interface LocalCacheEntry {
  url: string;
  createdAt: number;
  city: string;
  condition: string;
  isDay: boolean;
}

const generateCacheKey = (city: string, condition: string, isDay: boolean) => {
  const normalizedCity = city.toLowerCase().trim().replace(/\s+/g, '_');
  const daySuffix = isDay ? 'day' : 'night';
  return `${normalizedCity}_${condition.toLowerCase()}_${daySuffix}`;
};

const LOCAL_CACHE_PREFIX = '@image_cache:';
const LOCAL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check AsyncStorage for cached image (first layer - works offline)
 */
const checkLocalCache = async (key: string): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${LOCAL_CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: LocalCacheEntry = JSON.parse(cached);
    
    // Check if expired
    const age = Date.now() - entry.createdAt;
    if (age > LOCAL_CACHE_TTL_MS) {
      await AsyncStorage.removeItem(`${LOCAL_CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.url;
  } catch (error) {
    console.error('[LocalCache] Read failed:', error);
    return null;
  }
};

/**
 * Save to AsyncStorage (first layer - works offline)
 */
const saveLocalCache = async (key: string, data: LocalCacheEntry): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${LOCAL_CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('[LocalCache] Save failed:', error);
  }
};

// Track if Firebase is currently having issues (circuit breaker pattern)
let firebaseErrorCount = 0;
let lastErrorTime = 0;
const ERROR_THRESHOLD = 3;
const COOLDOWN_MS = 30000; // 30 seconds

const shouldSkipFirebase = (): boolean => {
  if (!isFirebaseAvailable || !db) {
    return true;
  }

  const now = Date.now();
  
  // Reset counter after cooldown period
  if (now - lastErrorTime > COOLDOWN_MS) {
    firebaseErrorCount = 0;
  }

  // Skip if we've had too many recent errors
  return firebaseErrorCount >= ERROR_THRESHOLD;
};

const recordFirebaseError = () => {
  firebaseErrorCount++;
  lastErrorTime = Date.now();
  
  if (firebaseErrorCount === ERROR_THRESHOLD) {
    console.warn('[Cache] Firebase temporarily disabled due to repeated errors. Will retry in 30s.');
  }
};

export const checkImageCache = async (
  city: string, 
  condition: string,
  isDay: boolean
): Promise<string | null> => {
  const key = generateCacheKey(city, condition, isDay);

  // 1. Check local AsyncStorage first (works offline)
  const localUrl = await checkLocalCache(key);
  if (localUrl) {
    // Don't log full base64 data URIs
    const isDataUri = localUrl.startsWith('data:');
    console.log('[Cache] Local hit:', isDataUri ? 'data:image/png;base64,...' : localUrl);
    return localUrl;
  }

  // 2. Skip Firebase if not available or having issues
  if (shouldSkipFirebase()) {
    return null;
  }

  // 3. Check Firebase
  try {
    const docRef = doc(db, 'city_images', key);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Reset error count on success
      firebaseErrorCount = 0;
      const url = docSnap.data().url as string;
      
      // Cache locally for offline access
      await saveLocalCache(key, {
        url,
        city,
        condition,
        isDay,
        createdAt: Date.now(),
      });
      
      return url;
    }
    return null;
  } catch (error) {
    // Only log the first few errors to avoid spam
    if (firebaseErrorCount < ERROR_THRESHOLD) {
      console.error('[Cache] Check failed:', error);
    }
    recordFirebaseError();
    return null;
  }
};

export const saveImageToCache = async (
  city: string, 
  condition: string, 
  isDay: boolean,
  url: string
) => {
  const key = generateCacheKey(city, condition, isDay);

  // 1. Always save to local AsyncStorage (works offline)
  await saveLocalCache(key, {
    url,
    city,
    condition,
    isDay,
    createdAt: Date.now(),
  });

  // 2. Try to save to Firebase if available
  if (shouldSkipFirebase()) {
    return;
  }

  try {
    await setDoc(doc(db, 'city_images', key), {
      url,
      city,
      condition,
      isDay,
      createdAt: Timestamp.now(),
    });
    
    // Reset error count on success
    firebaseErrorCount = 0;
  } catch (error) {
    // Only log the first few errors to avoid spam
    if (firebaseErrorCount < ERROR_THRESHOLD) {
      console.error('[Cache] Save failed:', error);
    }
    recordFirebaseError();
  }
};

/**
 * Invalidate cache for a specific city/condition/isDay combination
 * Called when a cached URL fails to load (expired fal.ai URL)
 */
export const invalidateImageCache = async (
  city: string,
  condition: string,
  isDay: boolean
): Promise<void> => {
  const key = generateCacheKey(city, condition, isDay);
  
  console.log('[Cache] Invalidating expired URL for:', key);

  // 1. Remove from local AsyncStorage
  try {
    await AsyncStorage.removeItem(`${LOCAL_CACHE_PREFIX}${key}`);
    console.log('[Cache] Local cache cleared for:', key);
  } catch (error) {
    console.error('[Cache] Failed to clear local cache:', error);
  }

  // 2. Don't remove from Firebase - it might still be valid for other users
  // The next generation will overwrite it anyway
};

