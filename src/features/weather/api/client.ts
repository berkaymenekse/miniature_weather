import axios from 'axios';
import { ENV } from '@/shared/config/env';
import { WeatherResponseSchema, type WeatherResponse } from '../model/schema';

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherResponse> => {
  const response = await axios.get(`${ENV.OPEN_METEO_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,weather_code,is_day',
      timezone: 'auto',
    },
  });

  // Zod validation
  return WeatherResponseSchema.parse(response.data);
};

