import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkImageCache, saveImageToCache, invalidateImageCache } from '../api/cache';
import { AiGenerator } from '../service/generator';
import { useCallback } from 'react';

export const useBackground = (city: string, condition: string, isDay: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['background', city, condition, isDay],
    queryFn: async () => {
      console.log('[useBackground] queryFn started', { city, condition, isDay });
      
      if (!city || !condition) {
        console.log('[useBackground] Invalid params, returning null');
        return null;
      }

      // 1. Check Cache
      const cachedUrl = await checkImageCache(city, condition, isDay);
      if (cachedUrl) {
        console.log('[useBackground] Cache hit:', cachedUrl);
        return cachedUrl;
      }

      // 2. Generate (if not found)
      console.log('[useBackground] Cache miss, generating...');
      const newUrl = await AiGenerator.generate(city, condition, isDay);
      console.log('[useBackground] Generated URL:', newUrl);
      
      // 3. Save to Cache (Fire and forget)
      saveImageToCache(city, condition, isDay, newUrl);

      return newUrl;
    },
    enabled: !!city && !!condition,
    staleTime: Infinity, // Once generated, it's good forever (per our "One-Time" rule)
    retry: 1,
  });

  /**
   * Invalidate cached URL and regenerate image
   * Called when cached fal.ai URL has expired
   */
  const invalidateAndRegenerate = useCallback(async () => {
    console.log('[useBackground] Invalidating expired URL and regenerating...');
    
    // 1. Clear the cache entry
    await invalidateImageCache(city, condition, isDay);
    
    // 2. Invalidate React Query cache
    queryClient.removeQueries({ 
      queryKey: ['background', city, condition, isDay] 
    });
    
    // 3. Trigger refetch (will skip cache and generate new image)
    await query.refetch();
  }, [city, condition, isDay, queryClient, query]);

  return {
    ...query,
    invalidateAndRegenerate,
  };
};

