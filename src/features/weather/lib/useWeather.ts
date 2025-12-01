import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/client';
import { mapWeatherCodeToCondition } from './weather-mapper';

export const useWeatherQuery = (lat: number | null, lon: number | null) => {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (data) => ({
      temp: Math.round(data.current.temperature_2m),
      condition: mapWeatherCodeToCondition(data.current.weather_code),
      isDay: data.current.is_day,
      rawCode: data.current.weather_code,
      time: data.current.time,
    }),
  });
};

