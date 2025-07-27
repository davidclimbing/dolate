import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';
import { isDummyConfig } from '@/lib/config';
import SupabaseSetupGuide from '@/components/SupabaseSetupGuide';

export default function AuthLayout() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  // Show setup guide if Supabase is not configured
  if (isDummyConfig()) {
    return <SupabaseSetupGuide />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Sign In',
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: 'Sign Up',
          headerShown: false,
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="setup" 
        options={{ 
          title: 'Setup',
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
    </Stack>
  );
}