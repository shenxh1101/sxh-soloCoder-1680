import { create } from 'zustand';
import type { User, RegionData, Warning, WeeklyReport, Institution } from '../types';
import { mockUsers, regionHierarchy } from '../mock/data';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => void;
  getAccessibleRegions: () => string[];
  getRegionFilter: <T extends { regionCode?: string; provinceCode?: string; cityCode?: string }>(data: T[]) => T[];
  filterProvinces: (provinces: RegionData[]) => RegionData[];
  filterWarnings: (warnings: Warning[]) => Warning[];
  filterReports: (reports: WeeklyReport[]) => WeeklyReport[];
  filterInstitutions: (institutions: Institution[]) => Institution[];
}

const STORAGE_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
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

  getAccessibleRegions: () => {
    const { user } = get();
    if (!user) return ['000000'];

    if (user.role === 'national') {
      return ['000000', ...regionHierarchy['000000'].children];
    }

    const region = regionHierarchy[user.regionCode];
    if (!region) return [user.regionCode];

    if (user.role === 'province') {
      return [user.regionCode, ...region.children];
    }

    return [user.regionCode];
  },

  getRegionFilter: <T extends { regionCode?: string; provinceCode?: string; cityCode?: string }>(data: T[]) => {
    const { user } = get();
    if (!user) return data;

    if (user.role === 'national') return data;

    if (user.role === 'institution' && user.institutionId) {
      return data.filter((d: any) => d.institutionId === user.institutionId);
    }

    const accessibleRegions = get().getAccessibleRegions();
    return data.filter((d) => {
      const code = d.regionCode || d.provinceCode || d.cityCode;
      return code && accessibleRegions.includes(code);
    });
  },

  filterProvinces: (provinces: RegionData[]) => {
    const { user } = get();
    if (!user || user.role === 'national') return provinces;

    if (user.role === 'province') {
      return provinces.filter((p) => p.regionCode === user.regionCode);
    }
    if (user.role === 'city') {
      const region = regionHierarchy[user.regionCode];
      if (region) {
        return provinces.filter((p) => p.regionCode === region.parent);
      }
    }
    return provinces;
  },

  filterWarnings: (warnings: Warning[]) => {
    return get().getRegionFilter<Warning>(warnings);
  },

  filterReports: (reports: WeeklyReport[]) => {
    return get().getRegionFilter<WeeklyReport>(reports);
  },

  filterInstitutions: (institutions: Institution[]) => {
    return get().getRegionFilter<Institution>(institutions);
  },
}));
