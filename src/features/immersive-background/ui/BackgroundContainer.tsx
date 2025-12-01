import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { useBackground } from '../lib/useBackground';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNetworkState } from '@/shared/lib/hooks/useNetworkState';

interface Props {
  city: string;
  condition: string;
  isDay: boolean;
  children?: React.ReactNode;
}

// Fallback gradients based on weather condition and time of day
const getFallbackGradient = (condition: string, isDay: boolean): readonly [string, string, ...string[]] => {
  const conditionLower = condition.toLowerCase();
  
  if (!isDay) {
    // Night gradients
    if (conditionLower.includes('clear')) return ['#0F2027', '#203A43', '#2C5364'];
    if (conditionLower.includes('rain')) return ['#1A1A2E', '#16213E', '#0F3460'];
    if (conditionLower.includes('snow')) return ['#232526', '#414345', '#616161'];
    if (conditionLower.includes('fog')) return ['#2C3E50', '#34495E', '#5D6D7E'];
    if (conditionLower.includes('cloud')) return ['#232526', '#414345'];
    return ['#141E30', '#243B55']; // Default night
  }
  
  // Day gradients
  if (conditionLower.includes('clear')) return ['#56CCF2', '#2F80ED', '#1E5F9E'];
  if (conditionLower.includes('rain')) return ['#536976', '#414B5A', '#292E49'];
  if (conditionLower.includes('snow')) return ['#83a4d4', '#b6fbff', '#a8d5ff'];
  if (conditionLower.includes('fog')) return ['#606c88', '#3f4c6b', '#2d3748'];
  if (conditionLower.includes('cloud')) return ['#757F9A', '#8E9EAB', '#6B7A8F'];
  return ['#56CCF2', '#2F80ED', '#1E5F9E']; // Default day
};

export const BackgroundContainer = ({ city, condition, isDay, children }: Props) => {
  const { data: imageUrl, isLoading, invalidateAndRegenerate } = useBackground(city, condition, isDay);
  const networkState = useNetworkState();
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1500, 3000, 5000]; // Exponential backoff: 1.5s, 3s, 5s

  // Reset error state when URL changes
  useEffect(() => {
    setImageError(false);
    setRetryCount(0);
    setImageKey((prev) => prev + 1);
    setIsRegenerating(false);
  }, [imageUrl]);

  // Retry logic with exponential backoff - even if network appears offline
  useEffect(() => {
    if (imageError && retryCount < MAX_RETRIES && imageUrl) {
      const delay = RETRY_DELAYS[retryCount] || 5000;
      console.log(`[Image] Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`);
      
      const timer = setTimeout(() => {
        console.log(`[Image] Retrying now...`);
        setImageError(false);
        setRetryCount((prev) => prev + 1);
        setImageKey((prev) => prev + 1); // Force image reload
      }, delay);

      return () => clearTimeout(timer);
    } else if (imageError && retryCount >= MAX_RETRIES && !isRegenerating) {
      // Max retries reached - URL is likely expired, invalidate cache and regenerate
      console.warn(`[Image] Max retries (${MAX_RETRIES}) reached. URL expired - regenerating...`);
      setIsRegenerating(true);
      invalidateAndRegenerate();
    }
  }, [imageError, retryCount, imageUrl, isRegenerating, invalidateAndRegenerate]);

  // Helper to format URL for logging (truncate base64 data URIs)
  const formatUrlForLog = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('data:')) return 'data:image/...';
    return url;
  };

  const handleImageLoad = useCallback(() => {
    console.log('[Image] ✅ Loaded successfully:', formatUrlForLog(imageUrl));
    setImageError(false);
    setRetryCount(0);
  }, [imageUrl]);

  const handleImageError = useCallback((error: any) => {
    console.error('[Image] Failed to load:', error, formatUrlForLog(imageUrl), 'Retry:', retryCount);
    setImageError(true);
  }, [imageUrl, retryCount]);

  const fallbackColors = getFallbackGradient(condition, isDay);

  // Check if we have a data URI (base64) - these are more reliable
  const isDataUri = imageUrl?.startsWith('data:');

  console.log('[BackgroundContainer]', { 
    city, 
    condition, 
    isDay, 
    imageUrl: formatUrlForLog(imageUrl),
    isDataUri,
    isLoading, 
    imageError, 
    retryCount,
    isRegenerating,
    networkConnected: networkState.isConnected 
  });

  // Show loading state when regenerating expired URL
  const showLoading = isLoading || isRegenerating;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fallback Gradient - Always render behind */}
      <LinearGradient
        colors={fallbackColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {showLoading && (
          <View style={StyleSheet.absoluteFill} className="items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </LinearGradient>

      {/* Background Image Layer - Overlays gradient when loaded */}
      {imageUrl && !showLoading && (imageError ? retryCount < MAX_RETRIES : true) && (
        <Animated.View 
          entering={FadeIn.duration(1000)} 
          style={StyleSheet.absoluteFill}
        >
          <Image
            key={imageKey}
            source={{ 
              uri: imageUrl,
              headers: {
                'Accept': 'image/*',
                'Cache-Control': 'no-cache',
              }
            }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={1000}
            cachePolicy="disk"
            priority="high"
            onLoad={handleImageLoad}
            onError={handleImageError}
            recyclingKey={`${city}-${condition}-${isDay}-${imageKey}`}
          />
          {/* Subtle gradient overlay for text readability */}
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* Content Layer */}
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </View>
  );
};

