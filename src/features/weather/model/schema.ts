import { z } from 'zod';

// WMO Weather Codes
export const WeatherCodeSchema = z.number();

export const CurrentWeatherSchema = z.object({
  time: z.string(),
  interval: z.number(),
  temperature_2m: z.number(),
  weather_code: WeatherCodeSchema,
  is_day: z.number().transform(val => val === 1),
});

export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),
  current_units: z.object({
    time: z.string(),
    interval: z.string(),
    temperature_2m: z.string(),
    weather_code: z.string(),
    is_day: z.string(),
  }),
  current: CurrentWeatherSchema,
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;

