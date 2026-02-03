import { create } from 'zustand';
import { User, LoginCredentials, SignUpCredentials } from '../types';
import { authService } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signUp: (credentials: SignUpCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updateBudgetLimit: (limit: number | undefined) => Promise<boolean>;
  updateAnnualBudgetLimit: (limit: number | undefined) => Promise<boolean>;
  updateBudgetLimits: (monthly: number | undefined, annual: number | undefined) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.login(credentials);

    if (error) {
      set({ isLoading: false, error });
      return false;
    }

    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  signUp: async (credentials) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.signUp(credentials);

    if (error) {
      set({ isLoading: false, error });
      return false;
    }

    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkSession: async () => {
    set({ isLoading: true });
    const user = await authService.getSession();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  updateProfile: async (data) => {
    const user = await authService.updateProfile(data);
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },

  updateBudgetLimit: async (limit) => {
    const user = await authService.updateProfile({ monthlyBudgetLimit: limit });
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },

  updateAnnualBudgetLimit: async (limit) => {
    const user = await authService.updateProfile({ annualBudgetLimit: limit });
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },

  updateBudgetLimits: async (monthly, annual) => {
    const user = await authService.updateProfile({
      monthlyBudgetLimit: monthly,
      annualBudgetLimit: annual,
    });
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));
