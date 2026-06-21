import { create } from 'zustand';
import type { RegionData, OccupationData } from '../types';
import { mockNationalMetrics, mockProvinceData, mockCityData, occupationData } from '../mock/data';

interface DashboardState {
  loading: boolean;
  viewMode: 'province' | 'occupation';
  nationalMetrics: RegionData | null;
  provinceData: RegionData[];
  selectedProvince: string | null;
  cityData: RegionData[];
  occupationData: OccupationData[];
  selectedOccupation: string | null;
  fetchNationalData: () => Promise<void>;
  fetchProvinceData: (provinceCode: string) => Promise<void>;
  selectProvince: (code: string) => void;
  clearSelection: () => void;
  setViewMode: (mode: 'province' | 'occupation') => void;
  selectOccupation: (code: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  loading: false,
  viewMode: 'province',
  nationalMetrics: null,
  provinceData: [],
  selectedProvince: null,
  cityData: [],
  occupationData: [],
  selectedOccupation: null,

  fetchNationalData: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      nationalMetrics: mockNationalMetrics,
      provinceData: mockProvinceData,
      occupationData: occupationData,
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
    set({ selectedProvince: code, viewMode: 'province' });
  },

  clearSelection: () => {
    set({ selectedProvince: null, cityData: [], selectedOccupation: null });
  },

  setViewMode: (mode: 'province' | 'occupation') => {
    set({
      viewMode: mode,
      selectedProvince: mode === 'province' ? null : undefined,
      selectedOccupation: mode === 'occupation' ? null : undefined,
      cityData: mode === 'occupation' ? [] : undefined,
    });
  },

  selectOccupation: (code: string | null) => {
    set({ selectedOccupation: code, viewMode: 'occupation' });
  },
}));
