import { create } from 'zustand';
import type { WeeklyReport } from '../types';
import { weeklyReports, generateWeeklyReport } from '../mock/data';

interface ReportState {
  reports: WeeklyReport[];
  currentReport: WeeklyReport | null;
  loading: boolean;
  generating: boolean;
  fetchReports: () => Promise<void>;
  fetchReportDetail: (id: string) => Promise<void>;
  generateReport: (regionCode: string, weekNumber: number, year: number) => Promise<WeeklyReport | null>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  loading: false,
  generating: false,

  fetchReports: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ reports: weeklyReports, loading: false });
  },

  fetchReportDetail: async (id: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const report = get().reports.find((r) => r.id === id) || weeklyReports.find((r) => r.id === id) || null;
    set({ currentReport: report, loading: false });
  },

  generateReport: async (regionCode: string, weekNumber: number, year: number) => {
    set({ generating: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newReport = generateWeeklyReport(regionCode, weekNumber, year);
    const updatedReports = [newReport, ...get().reports];

    set({ reports: updatedReports, currentReport: newReport, generating: false });
    return newReport;
  },
}));
