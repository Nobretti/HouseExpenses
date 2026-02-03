import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { config } from '../constants/config';
import { api } from './api';
import { User, AuthTokens, LoginCredentials, SignUpCredentials } from '../types';

// Custom storage adapter for Supabase using SecureStore on native and localStorage on web
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const authService = {
  async signUp(credentials: SignUpCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            display_name: credentials.displayName,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Check if user exists but needs email confirmation
      if (data.user && !data.session) {
        // User created but email confirmation required
        // Try to sign in immediately (works if email confirmation is disabled in Supabase)
        const signInResult = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (signInResult.error) {
          // Email confirmation might be required
          if (signInResult.error.message.toLowerCase().includes('email not confirmed')) {
            return { user: null, error: 'Please check your email to confirm your account before logging in.' };
          }
          return { user: null, error: signInResult.error.message };
        }

        // Use the sign-in session
        if (signInResult.data.user && signInResult.data.session) {
          const response = await api.post<AuthTokens>('/v1/auth/session', {
            userId: signInResult.data.user.id,
            displayName: credentials.displayName || signInResult.data.user.email,
          });

          if (!response.success || !response.data) {
            const errorMsg = response.error?.message || 'Failed to create session';
            return { user: null, error: errorMsg };
          }

          await api.setTokens(response.data.accessToken, response.data.refreshToken);

          return {
            user: {
              id: signInResult.data.user.id,
              email: signInResult.data.user.email || '',
              displayName: credentials.displayName,
              currency: 'EUR',
              locale: 'pt-PT',
            },
            error: null,
          };
        }
      }

      // User created with session (auto-confirmed)
      if (data.user && data.session) {
        // Create session in backend
        const response = await api.post<AuthTokens>('/v1/auth/session', {
          userId: data.user.id,
          displayName: credentials.displayName || data.user.email,
        });

        if (!response.success || !response.data) {
          const errorMsg = response.error?.message || 'Failed to create session';
          return { user: null, error: errorMsg };
        }

        await api.setTokens(response.data.accessToken, response.data.refreshToken);

        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            displayName: credentials.displayName,
            currency: 'EUR',
            locale: 'pt-PT',
          },
          error: null,
        };
      }

      return { user: null, error: 'Unknown error occurred' };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  },

  async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create session in backend
        const response = await api.post<AuthTokens>('/v1/auth/session', {
          userId: data.user.id,
          displayName: data.user.user_metadata?.display_name || data.user.email,
        });

        if (!response.success || !response.data) {
          const errorMsg = response.error?.message || 'Failed to create session';
          return { user: null, error: errorMsg };
        }

        await api.setTokens(response.data.accessToken, response.data.refreshToken);

        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.display_name,
            currency: 'EUR',
            locale: 'pt-PT',
          },
          error: null,
        };
      }

      return { user: null, error: 'Unknown error occurred' };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err.message : 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    await api.clearTokens();
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { success: !error, error: error?.message || null };
  },

  async resendConfirmationEmail(email: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    return { success: !error, error: error?.message || null };
  },

  async getSession(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Ensure backend tokens are refreshed when session exists
      try {
        const response = await api.post<AuthTokens>('/v1/auth/session', {
          userId: session.user.id,
          displayName: session.user.user_metadata?.display_name || session.user.email,
        });

        if (response.success && response.data) {
          await api.setTokens(response.data.accessToken, response.data.refreshToken);
        }

        // Fetch full profile from backend to get all settings including budget limits
        const profileResponse = await api.get<User>('/v1/auth/profile');
        if (profileResponse.success && profileResponse.data) {
          return {
            ...profileResponse.data,
            email: session.user.email || '',
          };
        }
      } catch (error) {
        // Continue even if backend session fails - user is still authenticated via Supabase
        console.warn('Failed to refresh backend session:', error);
      }

      return {
        id: session.user.id,
        email: session.user.email || '',
        displayName: session.user.user_metadata?.display_name,
        currency: 'EUR',
        locale: 'pt-PT',
      };
    }

    return null;
  },

  async getProfile(): Promise<User | null> {
    const response = await api.get<User>('/v1/auth/profile');
    return response.success ? response.data || null : null;
  },

  async updateProfile(data: Partial<User>): Promise<User | null> {
    const response = await api.put<User>('/v1/auth/profile', data);
    return response.success ? response.data || null : null;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
          currency: 'EUR',
          locale: 'pt-PT',
        });
      } else {
        callback(null);
      }
    });
  },
};
