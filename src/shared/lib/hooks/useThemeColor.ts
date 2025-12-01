import { useColorScheme } from "nativewind";

export const useThemeColor = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    mutedForeground: isDark ? '#A1A1AA' : '#64748B', // Zinc-400 / Slate-500
    foreground: isDark ? '#FAFAFA' : '#0F172A',
    background: isDark ? '#0F172A' : '#FFFFFF',
    border: isDark ? '#27272A' : '#E2E8F0',
  };
};

