import axios from 'axios';
import { ENV } from '@/shared/config/env';
import { z } from 'zod';

const GeoCitySchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
});

const GeocodingResponseSchema = z.object({
  results: z.array(GeoCitySchema).optional(),
});

export const searchCities = async (query: string) => {
  if (query.length < 2) return [];
  
  const response = await axios.get(`${ENV.GEOCODING_URL}/search`, {
    params: {
      name: query,
      count: 5,
      language: 'en',
      format: 'json',
    },
  });

  const data = GeocodingResponseSchema.parse(response.data);
  return data.results || [];
};

