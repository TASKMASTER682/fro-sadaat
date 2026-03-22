import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<{ pendingApproval: boolean }>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  fatherId?: string;
  fatherName?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('clan_token');
    if (!token) { set({ isInitialized: true }); return; }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, token, isInitialized: true });
    } catch {
      localStorage.removeItem('clan_token');
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, data } = res.data;
      localStorage.setItem('clan_token', token);
      set({ user: data, token, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', payload);
      const { token, data, pendingApproval } = res.data;
      localStorage.setItem('clan_token', token);
      set({ user: data, token, isLoading: false });
      return { pendingApproval };
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('clan_token');
    set({ user: null, token: null });
    window.location.href = '/auth/login';
  },

  updateUser: (user) => set({ user }),
}));
