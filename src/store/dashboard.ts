import { create } from 'zustand';
import type { RegionData } from '../types';
import { mockNationalMetrics, mockProvinceData, mockCityData } from '../mock/data';

interface DashboardState {
  loading: boolean;
  nationalMetrics: RegionData | null;
  provinceData: RegionData[];
  selectedProvince: string | null;
  cityData: RegionData[];
  fetchNationalData: () => Promise<void>;
  fetchProvinceData: (provinceCode: string) => Promise<void>;
  selectProvince: (code: string) => void;
  clearSelection: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  loading: false,
  nationalMetrics: null,
  provinceData: [],
  selectedProvince: null,
  cityData: [],

  fetchNationalData: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      nationalMetrics: mockNationalMetrics,
      provinceData: mockProvinceData,
      loading: false,
    });
  },

  fetchProvinceData: async (provinceCode: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cities = mockCityData[provinceCode] || [];
    set({ cityData: cities, loading: false });
  },

  selectProvince: (code: string) => {
    set({ selectedProvince: code });
  },

  clearSelection: () => {
    set({ selectedProvince: null, cityData: [] });
  },
}));
