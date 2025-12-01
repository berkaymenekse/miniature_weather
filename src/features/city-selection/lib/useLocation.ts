import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useCityStore } from '../model/store';

export const useCurrentLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectCity = useCityStore((s) => s.actions.selectCity);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // Reverse geocoding could be done here to get city name, 
      // but for now we just set coords with a generic name or fetch from API
      // Optimization: We can use OpenMeteo reverse geocoding if needed.
      
      selectCity({
        id: -1, // Special ID for GPS
        name: "Current Location",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        country: "",
      });

    } catch (err) {
      setError('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  return { requestLocation, isLoading, error };
};

