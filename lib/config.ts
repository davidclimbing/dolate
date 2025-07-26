import Constants from 'expo-constants';

// Environment configuration
export const Config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey,
  },
  app: {
    name: 'Dolate',
    version: Constants.expoConfig?.version || '1.0.0',
    isDev: __DEV__,
  },
  features: {
    enableRealtime: true,
    enableOfflineSync: true,
    metadataExtractionTimeout: 10000, // 10 seconds
    maxArticlesPerSync: 50,
  },
} as const;

// Validate required environment variables
export const validateConfig = () => {
  if (!Config.supabase.url) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!Config.supabase.anonKey) {
    throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  return true;
};

export default Config;