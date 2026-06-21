import { create } from 'zustand';
import type { User } from '../types';
import { mockUsers } from '../mock/data';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => void;
}

const STORAGE_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  login: (username: string, password: string) => {
    const user = mockUsers.find((u) => u.username === username);
    if (user && password) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isLoggedIn: true });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isLoggedIn: false });
  },

  checkAuth: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        set({ user, isLoggedIn: true });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  },
}));
