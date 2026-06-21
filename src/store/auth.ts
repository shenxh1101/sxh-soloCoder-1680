import { create } from 'zustand';
import type { User, RegionData, Warning, WeeklyReport, Institution, OccupationData } from '../types';
import { mockUsers, regionHierarchy, regionNameMap, mockCityData, institutions, nationalStandards } from '../mock/data';

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
  getViewScope: () => { level: 'country' | 'province' | 'city' | 'institution'; code: string; name: string };
  getAccessibleCityData: () => RegionData[];
  filterOccupationData: (data: OccupationData[]) => OccupationData[];
  getCurrentMetrics: (nationalMetrics: RegionData | null, provinceData: RegionData[]) => RegionData | null;
  canAccessRegion: (regionCode: string) => boolean;
  canAccessReport: (reportRegionCode: string) => boolean;
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

  canAccessRegion: (regionCode: string): boolean => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'national') return true;

    const accessibleRegions = get().getAccessibleRegions();
    return accessibleRegions.includes(regionCode);
  },

  canAccessReport: (reportRegionCode: string): boolean => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'national') return true;

    if (user.role === 'institution' && user.institutionId) {
      return false;
    }

    return get().canAccessRegion(reportRegionCode);
  },

  getViewScope: () => {
    const { user } = get();
    if (!user) {
      return { level: 'country', code: '000000', name: '全国' };
    }

    if (user.role === 'national') {
      return { level: 'country', code: '000000', name: '全国' };
    }

    if (user.role === 'province') {
      return {
        level: 'province',
        code: user.regionCode,
        name: regionNameMap[user.regionCode] || user.regionCode,
      };
    }

    if (user.role === 'city') {
      return {
        level: 'city',
        code: user.regionCode,
        name: regionNameMap[user.regionCode] || user.regionCode,
      };
    }

    if (user.role === 'institution' || user.role === 'academic') {
      return {
        level: 'institution',
        code: user.institutionId || user.regionCode,
        name: user.institutionName || regionNameMap[user.regionCode] || user.regionCode,
      };
    }

    return { level: 'country', code: '000000', name: '全国' };
  },

  getAccessibleCityData: () => {
    const { user } = get();
    if (!user || user.role === 'national') {
      return [];
    }

    if (user.role === 'province') {
      return mockCityData[user.regionCode] || [];
    }

    if (user.role === 'city') {
      const region = regionHierarchy[user.regionCode];
      if (region?.parent) {
        const provinceCities = mockCityData[region.parent] || [];
        return provinceCities.filter((c) => c.regionCode === user.regionCode);
      }
    }

    return [];
  },

  filterOccupationData: (data: OccupationData[]) => {
    const { user } = get();
    if (!user || user.role === 'national') return data;

    const accessibleInstitutions = get().filterInstitutions(institutions);

    return data.map((occ) => {
      const scaleFactor = Math.max(
        0.05,
        Math.min(1, accessibleInstitutions.length / 55)
      );

      return {
        ...occ,
        totalTrainees: Math.round(occ.totalTrainees * scaleFactor),
        passRate: Math.min(100, Math.max(50, occ.passRate + (Math.random() - 0.5) * 5)),
        employmentRate: Math.min(100, Math.max(40, occ.employmentRate + (Math.random() - 0.5) * 5)),
        certificateCount: Math.round(occ.certificateCount * scaleFactor),
      };
    });
  },

  getCurrentMetrics: (nationalMetrics: RegionData | null, provinceData: RegionData[]) => {
    const { user } = get();
    if (!user || user.role === 'national') {
      return nationalMetrics;
    }

    if (user.role === 'province') {
      const province = provinceData.find((p) => p.regionCode === user.regionCode);
      return province || null;
    }

    if (user.role === 'city') {
      const region = regionHierarchy[user.regionCode];
      if (region?.parent) {
        const provinceCities = mockCityData[region.parent] || [];
        const city = provinceCities.find((c) => c.regionCode === user.regionCode);
        if (city) return city;
      }
    }

    if (user.role === 'institution' && user.institutionId) {
      const inst = institutions.find((i) => i.id === user.institutionId);
      if (inst) {
        return {
          regionCode: inst.id,
          regionName: inst.name,
          regionLevel: 'institution',
          metrics: inst.metrics,
          trend: [],
        } as RegionData;
      }
    }

    return nationalMetrics;
  },
}));
