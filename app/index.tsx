import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';
import { useDemoStore, shouldUseDemoMode } from '@/lib/stores/demo';
import { isDummyConfig } from '@/lib/config';

export default function Index() {
  const { user, initialized } = useAuthStore();
  const { isDemo, enterDemoMode } = useDemoStore();

  useEffect(() => {
    console.log('🔄 Index.tsx useEffect triggered');
    console.log('🔄 initialized:', initialized);
    console.log('🔄 user:', !!user);
    console.log('🔄 isDemo:', isDemo);
    console.log('🔄 isDummyConfig:', isDummyConfig());
    
    if (initialized) {
      // If Supabase is not configured and demo mode is available, enter demo mode
      if (!user && isDummyConfig() && shouldUseDemoMode()) {
        console.log('🎭 Supabase not configured, entering demo mode automatically');
        enterDemoMode();
        router.replace('/(tabs)');
        return;
      }

      // Normal authentication flow
      if (user) {
        console.log('🔄 User exists, going to /(tabs)');
        router.replace('/(tabs)');
      } else if (isDemo) {
        console.log('🎭 Demo mode active, going to /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('🔄 No user, no demo, going to /(auth)/login');
        router.replace('/(auth)/login');
      }
    }
  }, [user, initialized, isDemo, enterDemoMode]);

  return null;
}