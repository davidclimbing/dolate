import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SyncService, BackgroundSync } from '../services/sync';
import { ArticleStorage } from '../storage/mmkv';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ loading: false });
    return { error };
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    set({ loading: false });
    return { error };
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
          // Initialize realtime sync
          await SyncService.initializeRealtime(newUser.id);
          // Start background sync
          BackgroundSync.start(newUser.id);
          console.log('Sync services initialized for user:', newUser.id);
        } else if (event === 'SIGNED_OUT') {
          // Cleanup sync services
          SyncService.cleanup();
          BackgroundSync.stop();
          // Clear user data from cache
          if (session?.user?.id) {
            ArticleStorage.clearUserArticles(session.user.id);
          }
          console.log('Sync services cleaned up');
        }
      });
    }
  },
}));