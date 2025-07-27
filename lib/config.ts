import Constants from 'expo-constants';

// Environment configuration with debugging
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

// Enhanced validation with better error messages
export const validateConfig = () => {
  console.log('🔧 Validating Supabase configuration...');
  console.log('URL from env:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log('URL from config:', Config.supabase.url);
  console.log('Key from env:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
  console.log('Is dummy config:', isDummyConfig());
  
  if (!Config.supabase.url || Config.supabase.url === 'https://your-project.supabase.co') {
    console.error('❌ Supabase URL is not configured properly');
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_URL is required. Please:\n' +
      '1. Create a Supabase project at https://supabase.com\n' +
      '2. Get your project URL from Settings → API\n' +
      '3. Update your .env file with the real URL\n' +
      '4. Stop the development server (Ctrl+C)\n' +
      '5. Restart with: bun start or expo start'
    );
  }
  
  if (!Config.supabase.anonKey || Config.supabase.anonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key')) {
    console.error('❌ Supabase anon key is not configured properly');
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is required. Please:\n' +
      '1. Go to your Supabase project Settings → API\n' +
      '2. Copy the "anon/public" key\n' +
      '3. Update your .env file with the real key\n' +
      '4. Stop the development server (Ctrl+C)\n' +
      '5. Restart with: bun start or expo start'
    );
  }

  // Additional validation for URL format
  if (!Config.supabase.url.startsWith('https://') || !Config.supabase.url.includes('.supabase.co')) {
    console.error('❌ Invalid Supabase URL format');
    throw new Error(
      'Invalid Supabase URL format. Expected format:\n' +
      'https://your-project-id.supabase.co\n' +
      'Current value: ' + Config.supabase.url
    );
  }

  // Additional validation for anon key format
  if (!Config.supabase.anonKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase anon key format');
    throw new Error(
      'Invalid Supabase anon key format. Expected JWT format starting with "eyJ"\n' +
      'Please copy the correct "anon/public" key from your Supabase project'
    );
  }
  
  console.log('✅ Supabase configuration is valid');
  return true;
};

// Helper to check if we're using dummy values
export const isDummyConfig = () => {
  return (
    Config.supabase.url === 'https://your-project.supabase.co' ||
    Config.supabase.anonKey?.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key') ||
    !Config.supabase.url ||
    !Config.supabase.anonKey
  );
};

export default Config;