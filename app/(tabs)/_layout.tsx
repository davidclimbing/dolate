import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth';
import { useDemoStore } from '@/lib/stores/demo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const { isDemo } = useDemoStore();

  useEffect(() => {
    console.log('📱 TabLayout useEffect - user:', !!user, 'isDemo:', isDemo);
    
    // Only redirect if neither user nor demo mode is active
    if (!user && !isDemo) {
      console.log('📱 No user and no demo, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [user, isDemo]);

  // Allow access if user exists OR demo mode is active
  if (!user && !isDemo) {
    console.log('📱 Blocking access - no user and no demo');
    return null;
  }

  console.log('📱 Allowing access to tabs - user:', !!user, 'demo:', isDemo);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Articles',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}