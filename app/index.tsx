import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';

export default function Index() {
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, initialized]);

  return null;
}