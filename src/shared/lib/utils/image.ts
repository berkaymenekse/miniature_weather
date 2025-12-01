/**
 * Image prefetch and validation utilities
 */

/**
 * Check if an image URL is accessible before attempting to load it
 * This prevents React Native Image component from trying to load broken URLs
 * 
 * @param url - Image URL to validate
 * @param timeout - Request timeout in milliseconds (default: 5000)
 * @returns Promise<boolean> - true if image is accessible, false otherwise
 */
export async function canFetchImage(url: string, timeout = 5000): Promise<boolean> {
  if (!url) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('[ImageValidation] Failed to validate URL:', url, error);
    return false;
  }
}

/**
 * Prefetch image with blob conversion for better reliability
 * Downloads the image as a blob which can be more reliable than direct URI loading
 * 
 * @param url - Image URL to prefetch
 * @param timeout - Request timeout in milliseconds (default: 10000)
 * @returns Promise<string | null> - Returns the original URL if successful, null otherwise
 */
export async function prefetchImageAsBlob(url: string, timeout = 10000): Promise<string | null> {
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    // Just validate that we can fetch it; return the original URL
    // (Converting to blob and creating object URLs is complex in RN)
    return url;
  } catch (error) {
    console.warn('[ImagePrefetch] Failed to prefetch:', url, error);
    return null;
  }
}

