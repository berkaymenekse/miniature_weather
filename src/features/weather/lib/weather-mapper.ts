/**
 * WMO Weather interpretation codes (WW)
 * Code | Description
 * 0	  | Clear sky
 * 1,2,3| Mainly clear, partly cloudy, and overcast
 * 45,48| Fog and depositing rime fog
 * 51-55| Drizzle: Light, moderate, and dense intensity
 * 56,57| Freezing Drizzle: Light and dense intensity
 * 61-65| Rain: Slight, moderate and heavy intensity
 * 66,67| Freezing Rain: Light and heavy intensity
 * 71-75| Snow fall: Slight, moderate, and heavy intensity
 * 77	  | Snow grains
 * 80-82| Rain showers: Slight, moderate, and violent
 * 85,86| Snow showers slight and heavy
 * 95 	| Thunderstorm: Slight or moderate
 * 96,99| Thunderstorm with slight and heavy hail
 */

export type WeatherCondition = 
  | 'Clear' 
  | 'Cloudy' 
  | 'Fog' 
  | 'Drizzle' 
  | 'Rain' 
  | 'Snow' 
  | 'Thunderstorm';

export const mapWeatherCodeToCondition = (code: number): WeatherCondition => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain';
  if (code <= 86) return 'Snow';
  return 'Thunderstorm';
};

export const getWeatherDescription = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'Clear': return 'Sunny & Clear';
    case 'Cloudy': return 'Partly Cloudy';
    case 'Fog': return 'Foggy';
    case 'Drizzle': return 'Light Drizzle';
    case 'Rain': return 'Rainy';
    case 'Snow': return 'Snowy';
    case 'Thunderstorm': return 'Stormy';
  }
};

/**
 * Generates a prompt suffix for the AI image generator
 */
export const getWeatherImagePrompt = (condition: WeatherCondition, isDay: boolean): string => {
  const time = isDay ? "bright daylight, sun visible" : "night scene, ambient city lights, subtle moonlight";
  const weather = {
    'Clear': "clear bright sky, optimal visibility",
    'Cloudy': "soft cloud cover, diffused lighting",
    'Fog': "atmospheric fog integrated with buildings, mysterious ambiance",
    'Drizzle': "light rain droplets on miniature buildings, subtle wetness",
    'Rain': "dynamic rain elements, wet surfaces with reflections, puddles around buildings",
    'Snow': "snow-covered miniature city, falling snowflakes, winter textures on architecture",
    'Thunderstorm': "dramatic storm clouds above, lighting effects, dark atmospheric mood",
  }[condition];

  return `${weather}, ${time}`;
};

