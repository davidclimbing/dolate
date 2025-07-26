import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initialize, initialized } = useAuthStore();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      initialize();
    }
  }, [loaded, initialize]);

  if (!loaded || !initialized) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="article/[id]" 
          options={{ 
            headerShown: true,
            title: 'Article'
          }} 
        />
        <Stack.Screen 
          name="add-url" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Add Article'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}