import { create } from 'zustand';
import type { WeeklyReport } from '../types';
import { weeklyReports } from '../mock/data';

interface ReportState {
  reports: WeeklyReport[];
  currentReport: WeeklyReport | null;
  loading: boolean;
  fetchReports: () => Promise<void>;
  fetchReportDetail: (id: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  currentReport: null,
  loading: false,

  fetchReports: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ reports: weeklyReports, loading: false });
  },

  fetchReportDetail: async (id: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const report = weeklyReports.find((r) => r.id === id) || null;
    set({ currentReport: report, loading: false });
  },
}));
