import { create } from 'zustand';
import type { WeeklyReport, ReportDiffSummary } from '../types';
import { weeklyReports, generateWeeklyReport } from '../mock/data';

interface ReportState {
  reports: WeeklyReport[];
  currentReport: WeeklyReport | null;
  loading: boolean;
  generating: boolean;
  fetchReports: () => Promise<void>;
  fetchReportDetail: (id: string) => Promise<void>;
  generateReport: (regionCode: string, weekNumber: number, year: number) => Promise<WeeklyReport | null>;
  compareReports: (reportAId: string, reportBId: string) => ReportDiffSummary | null;
}

const generateReportDiff = (a: WeeklyReport, b: WeeklyReport): ReportDiffSummary => {
  const earlier = (a.year < b.year || (a.year === b.year && a.weekNumber < b.weekNumber)) ? a : b;
  const later = earlier === a ? b : a;

  const aCycle = earlier.metrics.certificateCycleDays || 15;
  const bCycle = later.metrics.certificateCycleDays || 14;

  const aSuggestions = new Set(earlier.optimizationSuggestions.map(s => s.content));
  const added = later.optimizationSuggestions.filter(s => !aSuggestions.has(s.content));
  const removed = earlier.optimizationSuggestions.filter(s => !later.optimizationSuggestions.some(t => t.content === s.content));
  const sameCategory = later.optimizationSuggestions.filter(s =>
    earlier.optimizationSuggestions.some(t => t.category === s.category && !added.includes(s))
  );

  const passDiff = later.metrics.passRate - earlier.metrics.passRate;
  const empDiff = later.metrics.employmentRate - earlier.metrics.employmentRate;
  const cycleDiff = bCycle - aCycle;

  const analysisParts: string[] = [];
  analysisParts.push(`**合格率**：从 ${earlier.metrics.passRate.toFixed(1)}% 变为 ${later.metrics.passRate.toFixed(1)}%，${passDiff >= 0 ? '上升' : '下降'} ${Math.abs(passDiff).toFixed(1)} 个百分点${passDiff >= 0 ? '，培训质量稳步提升' : '，需要关注培训环节问题'}。`);
  analysisParts.push(`**就业率**：从 ${earlier.metrics.employmentRate.toFixed(1)}% 变为 ${later.metrics.employmentRate.toFixed(1)}%，${empDiff >= 0 ? '上升' : '下降'} ${Math.abs(empDiff).toFixed(1)} 个百分点${empDiff >= 0 ? '，就业转化效能良好' : '，建议加强就业服务对接'}。`);
  analysisParts.push(`**证书发放周期**：从 ${aCycle} 天变为 ${bCycle} 天，${cycleDiff <= 0 ? '缩短' : '增加'} ${Math.abs(cycleDiff)} 天${cycleDiff <= 0 ? '，审批效率提升' : '，流程有待优化'}。`);
  if (added.length > 0) analysisParts.push(`**新增优化建议** ${added.length} 条，覆盖${added.map(s => s.category === 'curriculum' ? '课程' : '师资').filter((v, i, arr) => arr.indexOf(v) === i).join('、')}等方面。`);
  if (removed.length > 0) analysisParts.push(`**已完成/移除建议** ${removed.length} 条。`);

  return {
    id: `DIFF-${earlier.id}-${later.id}`,
    reportA: { id: earlier.id, weekStart: earlier.weekStart, weekEnd: earlier.weekEnd, year: earlier.year, weekNumber: earlier.weekNumber },
    reportB: { id: later.id, weekStart: later.weekStart, weekEnd: later.weekEnd, year: later.year, weekNumber: later.weekNumber },
    regionName: later.regionName,
    metricsDiff: {
      passRate: { old: earlier.metrics.passRate, now: later.metrics.passRate, diff: passDiff },
      employmentRate: { old: earlier.metrics.employmentRate, now: later.metrics.employmentRate, diff: empDiff },
      certificateCycle: { old: aCycle, now: bCycle, diff: cycleDiff },
    },
    suggestionChanges: { added, removed, sameCategory },
    analysisText: analysisParts.join('\n'),
  };
};

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

  compareReports: (reportAId: string, reportBId: string) => {
    const reportA = get().reports.find(r => r.id === reportAId);
    const reportB = get().reports.find(r => r.id === reportBId);
    if (!reportA || !reportB) return null;
    if (reportA.regionCode !== reportB.regionCode) return null;
    return generateReportDiff(reportA, reportB);
  },
}));
