import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Config, validateConfig } from './config';

// Platform-aware storage for web SSR compatibility
const createPlatformStorage = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    // Browser environment - use localStorage
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  } else if (typeof global !== 'undefined') {
    // Server-side rendering or Node.js environment - use in-memory storage
    const memoryStorage: Record<string, string> = {};
    return {
      getItem: (key: string) => Promise.resolve(memoryStorage[key] || null),
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
        return Promise.resolve();
      },
    };
  } else {
    // React Native environment - use AsyncStorage
    return AsyncStorage;
  }
};

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error('❌ Supabase configuration error:', error);
  // In development, show helpful error message
  if (__DEV__) {
    console.error('\n🔧 To fix this:\n1. Create a Supabase project at https://supabase.com\n2. Update your .env file with real credentials');
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || Config.supabase.url || 'https://placeholder.supabase.co', 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Config.supabase.anonKey || 'placeholder-key', 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: createPlatformStorage(),
    detectSessionInUrl: false, // Prevent issues in React Native
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': `dolate-mobile/${Config.app.version}`,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          url: string;
          content?: string;
          description?: string;
          image_url?: string;
          author?: string;
          published_at?: string;
          domain: string;
          is_read: boolean;
          is_favorite: boolean;
          tags: string[];
          reading_time?: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          content?: string;
          description?: string;
          image_url?: string;
          author?: string;
          published_at?: string;
          domain: string;
          is_read?: boolean;
          is_favorite?: boolean;
          tags?: string[];
          reading_time?: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          content?: string;
          description?: string;
          image_url?: string;
          author?: string;
          published_at?: string;
          domain?: string;
          is_read?: boolean;
          is_favorite?: boolean;
          tags?: string[];
          reading_time?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};