import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BackgroundContainer } from '@/features/immersive-background';
import { WeatherWidget } from '@/widgets/weather-card';
import { useCityStore } from '@/features/city-selection';
import { useWeatherQuery } from '@/features/weather';

export default function HomeScreen() {
  const selectedCity = useCityStore((s) => s.selectedCity);
  
  // We fetch here too to drive the background
  // React Query dedupes this request with the one in WeatherWidget
  const { data: weather } = useWeatherQuery(
    selectedCity?.latitude ?? null,
    selectedCity?.longitude ?? null
  );

  // Default background if no city selected or loading
  // We use a generic "Clear" day for the initial look or keep it empty
  const city = selectedCity?.name ?? "Istanbul"; // Default for visual testing if null
  const condition = weather?.condition ?? "Clear";
  const isDay = weather?.isDay ?? true;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      <BackgroundContainer 
        city={city} 
        condition={condition} 
        isDay={isDay}
      >
        <WeatherWidget />
      </BackgroundContainer>
    </View>
  );
}
