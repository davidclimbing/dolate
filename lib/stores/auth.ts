import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { isDummyConfig } from '../config';

// Lazy imports for SSR compatibility
let SyncService: any, BackgroundSync: any, ArticleStorage: any;

// Import these only in browser environment
if (typeof window !== 'undefined') {
  import('../services/sync').then(module => {
    SyncService = module.SyncService;
    BackgroundSync = module.BackgroundSync;
  });
  
  import('../storage/mmkv').then(module => {
    ArticleStorage = module.ArticleStorage;
  });
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ 
    error?: any; 
    user?: any; 
    needsEmailConfirmation?: boolean 
  }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    // Check if Supabase is properly configured
    if (isDummyConfig()) {
      return { 
        error: { 
          message: 'Supabase is not configured. Please set up your Supabase project credentials in the .env file.' 
        } 
      };
    }

    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ loading: false });
    return { error };
  },

  signUp: async (email: string, password: string) => {
    // Check if Supabase is properly configured
    if (isDummyConfig()) {
      return { 
        error: { 
          message: 'Supabase is not configured. Please set up your Supabase project credentials in the .env file.' 
        } 
      };
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      
      set({ loading: false });
      
      if (error) {
        return { error };
      }
      
      // Return success with user data
      return { 
        error: null, 
        user: data.user,
        needsEmailConfirmation: !data.user?.email_confirmed_at 
      };
    } catch (error) {
      set({ loading: false });
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      };
    }
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  initialize: async () => {
    try {
      // Check if we're in browser environment before calling getSession
      if (typeof window === 'undefined') {
        // SSR environment - just mark as initialized without session
        set({ 
          session: null, 
          user: null, 
          initialized: true 
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        session, 
        user: session?.user ?? null, 
        initialized: true 
      });
    } catch (error) {
      console.warn('Auth initialization failed:', error);
      set({ 
        session: null, 
        user: null, 
        initialized: true 
      });
    }

    // Listen for auth changes (only in browser environment)
    if (typeof window !== 'undefined') {
      supabase.auth.onAuthStateChange(async (event, session) => {
        const newUser = session?.user ?? null;
        set({ 
          session, 
          user: newUser 
        });
        
        if (event === 'SIGNED_IN' && newUser) {
          // Initialize realtime sync (only if modules are loaded)
          if (SyncService && BackgroundSync) {
            await SyncService.initializeRealtime(newUser.id);
            BackgroundSync.start(newUser.id);
            console.log('Sync services initialized for user:', newUser.id);
          }
        } else if (event === 'SIGNED_OUT') {
          // Cleanup sync services (only if modules are loaded)
          if (SyncService && BackgroundSync) {
            SyncService.cleanup();
            BackgroundSync.stop();
          }
          // Clear user data from cache (only if module is loaded)
          if (ArticleStorage && session?.user?.id) {
            ArticleStorage.clearUserArticles(session.user.id);
          }
          console.log('Sync services cleaned up');
        }
      });
    }
  },
}));