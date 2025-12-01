import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/shared/lib/storage'; // Need to create this adapter

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface CityState {
  selectedCity: City | null;
  actions: {
    selectCity: (city: City) => void;
  };
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null, // Default state
      actions: {
        selectCity: (city) => set({ selectedCity: city }),
      },
    }),
    {
      name: 'city-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ selectedCity: state.selectedCity }),
    }
  )
);

