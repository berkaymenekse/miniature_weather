import { getWeatherImagePrompt } from '@/features/weather';
import { fal } from "@fal-ai/client";
import { ENV } from '@/shared/config/env';

export interface ImageGenerator {
  generate(city: string, condition: string, isDay: boolean): Promise<string>;
}

fal.config({
  credentials: ENV.FAL_KEY,
});

export const MockGenerator: ImageGenerator = {
  generate: async (city, condition, isDay) => {
    // Simulating AI delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const weatherDetails = getWeatherImagePrompt(condition as any, isDay);
    const fullPrompt = `Present a clear, 45° top-down view of a vertical (9:16) isometric miniature 3D cartoon scene, highlighting iconic landmarks of ${city} centered in the composition to showcase precise and delicate modeling. The scene features soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadow effects. Weather elements are creatively integrated into the urban architecture: ${weatherDetails}, establishing a dynamic interaction between the city's landscape and atmospheric conditions, creating an immersive weather ambiance. Use a clean, unified composition with minimalistic aesthetics and a soft, solid-colored background that highlights the main content. The overall visual style is fresh and soothing. Display the city name (large text) positioned directly above the weather icon. The weather information has no background and can subtly overlap with the buildings. The text should match the input city's native language. City name: ${city}`;
    
    console.log(`[AI Mock] Generating for ${city} - ${condition} (${isDay ? 'Day' : 'Night'})`);
    console.log(`[AI Mock] Prompt: ${fullPrompt}`);

    // Return a placeholder that looks good
    // In production, this calls the AI API
    return `https://picsum.photos/seed/${city}${condition}/1080/1920`; 
  }
};

export const AiGenerator: ImageGenerator = {
  generate: async (city, condition, isDay) => {
    if (!ENV.FAL_KEY) {
      console.warn("[Fal AI] Missing API Key, falling back to Mock");
      return MockGenerator.generate(city, condition, isDay);
    }

    const weatherDetails = getWeatherImagePrompt(condition as any, isDay);
    const fullPrompt = `Present a clear, 45° top-down view of a vertical (9:16) isometric miniature 3D cartoon scene, highlighting iconic landmarks of ${city} centered in the composition to showcase precise and delicate modeling. The scene features soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadow effects. Weather elements are creatively integrated into the urban architecture: ${weatherDetails}, establishing a dynamic interaction between the city's landscape and atmospheric conditions, creating an immersive weather ambiance. Use a clean, unified composition with minimalistic aesthetics and a soft, solid-colored background that highlights the main content. The overall visual style is fresh and soothing. Display the city name (large text) positioned directly above the weather icon. The weather information has no background and can subtly overlap with the buildings. The text should match the input city's native language. City name: ${city}`;

    console.log(`[Fal AI] Generating for ${city}...`);

    try {
      const result: any = await fal.subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: fullPrompt,
          aspect_ratio: "9:16",
          num_images: 1,
          output_format: "png",
          // Use sync_mode to get base64 data directly - bypasses network download issues
          sync_mode: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      const imageData = result.data?.images?.[0];
      
      // With sync_mode, we get file_data (base64) directly
      if (imageData?.file_data) {
        const dataUri = `data:${imageData.content_type || 'image/png'};base64,${imageData.file_data}`;
        console.log("[Fal AI] Success: Got base64 data directly (sync_mode)");
        return dataUri;
      }
      
      // Fallback to URL if sync_mode didn't return file_data
      if (imageData?.url) {
        console.log("[Fal AI] Success (URL mode):", imageData.url);
        return imageData.url;
      }
      
      throw new Error("No image data received");

    } catch (error) {
      console.error("[Fal AI] Error generating image:", error);
      // Fallback to mock on error
      return MockGenerator.generate(city, condition, isDay);
    }
  }
};
