import { supabase } from '../supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: any;
}

export class AuthAPI {
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  }

  static async signOut(): Promise<{ error?: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getSession(): Promise<{ session: Session | null; error?: any }> {
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error,
    };
  }

  static async resetPassword(email: string): Promise<{ error?: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  static async updatePassword(password: string): Promise<{ error?: any }> {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  }

  static async updateProfile(updates: { email?: string; data?: any }): Promise<{ error?: any }> {
    const { error } = await supabase.auth.updateUser(updates);
    return { error };
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}