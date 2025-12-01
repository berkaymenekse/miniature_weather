import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useCityStore } from '@/features/city-selection';
import { useWeatherQuery, getWeatherDescription } from '@/features/weather';
import { format } from 'date-fns';
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, Moon, Search as SearchIcon } from 'lucide-react-native';
import { CitySearch } from '@/features/city-selection';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WeatherIcon = ({ condition, isDay, size = 64 }: { condition: string, isDay: boolean, size?: number }) => {
  const color = "white";
  
  if (!isDay && condition === 'Clear') return <Moon size={size} color={color} />;

  switch (condition) {
    case 'Clear': return <Sun size={size} color={color} />;
    case 'Cloudy': return <Cloud size={size} color={color} />;
    case 'Rain': return <CloudRain size={size} color={color} />;
    case 'Snow': return <CloudSnow size={size} color={color} />;
    case 'Drizzle': return <CloudDrizzle size={size} color={color} />;
    case 'Thunderstorm': return <CloudLightning size={size} color={color} />;
    default: return <Cloud size={size} color={color} />;
  }
};

export const WeatherWidget = () => {
  const [showSearch, setShowSearch] = useState(false);
  const selectedCity = useCityStore((s) => s.selectedCity);
  const insets = useSafeAreaInsets();
  
  const { data: weather, isLoading } = useWeatherQuery(
    selectedCity?.latitude ?? null,
    selectedCity?.longitude ?? null
  );

  if (!selectedCity) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View entering={FadeIn} className="items-center">
          <Text variant="heading" size="2xl" className="text-white mb-2 text-center">
            Welcome to Miniature Weather
          </Text>
          <Text className="text-white/80 mb-8 text-center text-base">
            Select a city to see its weather
          </Text>
          <CitySearch />
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Search Button - Floating */}
      <View className="absolute right-6 z-50" style={{ top: insets.top + 16 }}>
        <Pressable
          onPress={() => setShowSearch(!showSearch)}
          className="bg-white/20 backdrop-blur-md rounded-full p-3 active:bg-white/30"
        >
          <SearchIcon size={24} color="white" />
        </Pressable>
      </View>

      {/* Search Overlay */}
      {showSearch && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          className="absolute left-0 right-0 z-40 px-6"
          style={{ top: insets.top + 8, paddingTop: 8 }}
        >
          <BlurView intensity={80} tint="dark" className="rounded-2xl overflow-hidden">
            <View className="p-4">
              <CitySearch />
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Main Weather Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View entering={FadeIn.delay(200)} className="items-center">
          {/* City Name - Large and Bold */}
          <Text 
            variant="heading" 
            className="text-6xl text-white font-bold text-center mb-8"
            style={{ 
              textShadowColor: 'rgba(0,0,0,0.8)', 
              textShadowOffset: { width: 0, height: 4 }, 
              textShadowRadius: 12,
              letterSpacing: 2
            }}
          >
            {selectedCity.name}
          </Text>

          {/* Weather Info Card */}
          {isLoading || !weather ? (
            <View className="items-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 min-w-[280px]">
              {/* Skeleton Icon */}
              <View className="w-24 h-24 bg-white/20 rounded-full animate-pulse" />
              
              {/* Skeleton Temperature */}
              <View className="w-32 h-20 bg-white/20 rounded-2xl mt-4 animate-pulse" />
              
              {/* Skeleton Condition */}
              <View className="w-40 h-6 bg-white/20 rounded-lg mt-2 animate-pulse" />
              
              {/* Skeleton Date */}
              <View className="mt-6 pt-6 border-t border-white/20 w-full">
                <View className="w-48 h-4 bg-white/20 rounded mx-auto animate-pulse" />
              </View>
            </View>
          ) : (
            <View className="items-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 min-w-[280px]">
              {/* Weather Icon */}
              <WeatherIcon condition={weather.condition} isDay={weather.isDay} size={96} />
              
              {/* Temperature - Hero */}
              <Text 
                className="text-white text-8xl font-extralight mt-4"
                style={{ 
                  textShadowColor: 'rgba(0,0,0,0.4)', 
                  textShadowOffset: { width: 0, height: 2 }, 
                  textShadowRadius: 8 
                }}
              >
                {weather.temp}°
              </Text>

              {/* Condition */}
              <Text className="text-white text-2xl font-medium mt-2">
                {getWeatherDescription(weather.condition)}
              </Text>

              {/* Date */}
              <View className="mt-6 pt-6 border-t border-white/20 w-full">
                <Text className="text-white/80 text-center text-sm uppercase tracking-widest">
                  {format(new Date(), 'EEEE, MMMM d')}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

