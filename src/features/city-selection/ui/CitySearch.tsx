import React, { useState } from 'react';
import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Input } from '@/shared/ui/input';
import { Text } from '@/shared/ui/text';
import { useQuery } from '@tanstack/react-query';
import { searchCities } from '../api/geocoding';
import { useCityStore, type City } from '../model/store';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import { Search, MapPin, X } from 'lucide-react-native';

export const CitySearch = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const selectCity = useCityStore((s) => s.actions.selectCity);
  const [isOpen, setIsOpen] = useState(false);

  const { data: cities, isLoading } = useQuery({
    queryKey: ['city-search', debouncedQuery],
    queryFn: () => searchCities(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (city: City) => {
    selectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <View className="w-full max-w-md">
      {/* Search Input */}
      <View className="relative">
        <Input
          placeholder="Search for a city..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (t.length > 0) setIsOpen(true);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          leftElement={<Search size={20} color="white" />}
          rightElement={
            query.length > 0 ? (
              <Pressable onPress={clearSearch} className="p-1">
                <X size={20} color="white" />
              </Pressable>
            ) : undefined
          }
          className="bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/50"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View className="absolute right-12 top-3">
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
      </View>

      {/* Results Dropdown */}
      {isOpen && cities && cities.length > 0 && (
        <View className="mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden max-h-80">
          <FlatList
            data={cities.slice(0, 8)} // Limit to 8 results
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className="flex-row items-center px-5 py-4 border-b border-gray-100 active:bg-blue-50"
              >
                <View className="bg-blue-500/10 rounded-full p-2 mr-3">
                  <MapPin size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-base">
                    {item.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {item.admin1}{item.country ? `, ${item.country}` : ''}
                  </Text>
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* No Results */}
      {isOpen && !isLoading && cities?.length === 0 && debouncedQuery.length >= 2 && (
        <View className="mt-2 bg-white/95 backdrop-blur-xl rounded-2xl p-6 items-center">
          <Text className="text-gray-600 text-center">
            No cities found for "{debouncedQuery}"
          </Text>
        </View>
      )}
    </View>
  );
};

