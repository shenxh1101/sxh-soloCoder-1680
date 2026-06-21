import { create } from 'zustand';
import type { Warning, WarningApprovalStatus, RectificationTracking, RectificationMilestone } from '../types';
import { mockWarnings } from '../mock/data';

const STORAGE_KEY = 'warnings_data';

const loadWarningsFromStorage = (): Warning[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Warning[];
    }
  } catch {
    // ignore
  }
  return [];
};

const saveWarningsToStorage = (warnings: Warning[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(warnings));
  } catch {
    // ignore
  }
};

const updateApprovalStatus = (warning: Warning): Warning => {
  const { steps, currentStep } = warning.approvalFlow;
  const rect = warning.rectification;

  let approvalStatus: WarningApprovalStatus = 'pending';

  const hasRejected = steps.some(s => s.status === 'rejected');
  if (hasRejected) {
    approvalStatus = 'rejected';
  } else if (rect?.reviewResult === 'pass') {
    approvalStatus = 'closed';
  } else if (rect && rect.milestones.length > 0 && rect.milestones.every(m => m.status === 'completed') && !rect.reviewResult) {
    approvalStatus = 'pending_review';
  } else if (rect && rect.milestones.length > 0) {
    approvalStatus = 'rectification_in_progress';
  } else if (currentStep > 3) {
    approvalStatus = 'province_approved';
  } else if (currentStep === 3) {
    const step3 = steps.find(s => s.step === 3);
    if (step3?.status === 'completed') {
      approvalStatus = 'province_approved';
    } else {
      approvalStatus = 'district_approved';
    }
  } else if (currentStep === 2) {
    approvalStatus = 'institution_approved';
  }

  const hasRectification = steps.some(s => s.title === '提交整改方案' && s.status === 'completed');
  if (hasRectification && !hasRejected && approvalStatus === 'pending') {
    approvalStatus = 'rectification_submitted';
  }

  return { ...warning, approvalStatus };
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const defaultRectificationPlan = (warningId: string): RectificationTracking => {
  const now = new Date();
  return {
    id: `rect_${warningId}`,
    warningId,
    plan: '加强师资配置，完善课程体系，建立定期质量监控机制。具体包括：1) 对现有教师进行技能再培训；2) 补充实操教学设备；3) 优化课程大纲；4) 建立月度质量评估制度。',
    startDate: formatDate(now),
    expectedEndDate: formatDate(addDays(now, 60)),
    milestones: [
      {
        id: `${warningId}_m1`,
        title: '师资培训完成',
        deadline: formatDate(addDays(now, 15)),
        status: 'pending',
      },
      {
        id: `${warningId}_m2`,
        title: '设备补充到位',
        deadline: formatDate(addDays(now, 30)),
        status: 'pending',
      },
      {
        id: `${warningId}_m3`,
        title: '课程大纲优化完成',
        deadline: formatDate(addDays(now, 45)),
        status: 'pending',
      },
      {
        id: `${warningId}_m4`,
        title: '质量监控体系建立并试运行',
        deadline: formatDate(addDays(now, 60)),
        status: 'pending',
      },
    ],
  };
};

interface WarningState {
  warnings: Warning[];
  currentWarning: Warning | null;
  loading: boolean;
  initialized: boolean;
  fetchWarnings: () => Promise<void>;
  fetchWarningDetail: (id: string) => Promise<void>;
  approveStep: (step: 1 | 2 | 3, comment: string) => void;
  rejectStep: (step: 1 | 2 | 3, comment: string) => void;
  submitRectificationPlan: (step: 1 | 2 | 3, plan: string) => void;
  startRectification: (warningId: string, plan?: string) => void;
  updateMilestone: (warningId: string, milestoneId: string, status: RectificationMilestone['status'], remark?: string) => void;
  submitReview: (warningId: string, result: 'pass' | 'fail', comment: string) => void;
  saveAndPersist: (warning: Warning) => void;
}

export const useWarningStore = create<WarningState>((set, get) => ({
  warnings: [],
  currentWarning: null,
  loading: false,
  initialized: false,

  fetchWarnings: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storedWarnings = loadWarningsFromStorage();
    let warnings: Warning[];

    if (storedWarnings.length > 0) {
      warnings = storedWarnings.map(w => updateApprovalStatus(w));
    } else {
      warnings = mockWarnings.map(w => updateApprovalStatus(w));
      saveWarningsToStorage(warnings);
    }

    set({ warnings, loading: false, initialized: true });
  },

  fetchWarningDetail: async (id: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { warnings, initialized, fetchWarnings } = get();

    if (!initialized || warnings.length === 0) {
      await fetchWarnings();
    }

    const currentWarnings = get().warnings;
    const warning = currentWarnings.find((w) => w.id === id) || null;

    set({ currentWarning: warning, loading: false });
  },

  saveAndPersist: (warning: Warning) => {
    const updatedWarning = updateApprovalStatus(warning);
    const updatedWarnings = get().warnings.map(w => w.id === warning.id ? updatedWarning : w);
    saveWarningsToStorage(updatedWarnings);
    set({ warnings: updatedWarnings, currentWarning: updatedWarning });
  },

  approveStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nextStep = step < 3 ? (step + 1) : 4;

    let updatedWarning: Warning = {
      ...currentWarning,
      status: step === 3 ? 'rectification' : 'processing',
      approvalFlow: {
        ...currentWarning.approvalFlow,
        currentStep: nextStep as 0 | 1 | 2 | 3 | 4,
        steps: currentWarning.approvalFlow.steps.map((s) =>
          s.step === step
            ? {
                ...s,
                status: 'completed' as const,
                comment,
                opinion: comment,
                operator: '当前用户',
                operatorName: '当前用户',
                time: timeStr,
                operatedAt: now.toISOString(),
              }
            : s.step === step + 1
              ? { ...s, status: 'current' as const }
              : s
        ),
        ...(step === 3 ? { finalDecision: 'adjust_plan' as const } : {}),
      },
    };

    if (step === 3 && !updatedWarning.rectification) {
      updatedWarning.rectification = defaultRectificationPlan(updatedWarning.id);
    }

    get().saveAndPersist(updatedWarning);
  },

  rejectStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let updatedWarning: Warning = {
      ...currentWarning,
      status: 'rejected',
      approvalFlow: {
        ...currentWarning.approvalFlow,
        currentStep: (step as 0 | 1 | 2 | 3) > 1 ? ((step - 1) as 0 | 1 | 2 | 3) : 1,
        steps: currentWarning.approvalFlow.steps.map((s) =>
          s.step === step
            ? {
                ...s,
                status: 'rejected' as const,
                comment,
                opinion: comment,
                operator: '当前用户',
                operatorName: '当前用户',
                time: timeStr,
                operatedAt: now.toISOString(),
              }
            : s.step === step - 1
              ? { ...s, status: 'current' as const }
              : s.step > step
                ? { ...s, status: 'pending' as const }
                : s
        ),
      },
    };

    get().saveAndPersist(updatedWarning);
  },

  submitRectificationPlan: (step: 1 | 2 | 3, plan: string) => {
    const { currentWarning } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const rectificationStep = {
      id: `step_rect_${Date.now()}`,
      step: step + 0.5 as any,
      title: '提交整改方案',
      role: 'institution' as const,
      status: 'completed' as const,
      operator: '当前用户',
      operatorName: '当前用户',
      time: timeStr,
      operatedAt: now.toISOString(),
      comment: plan,
      opinion: plan,
    };

    const updatedSteps = [
      ...currentWarning.approvalFlow.steps.slice(0, step),
      rectificationStep,
      ...currentWarning.approvalFlow.steps.slice(step).map((s) =>
        s.step === step ? { ...s, status: 'current' as const } : s
      ),
    ];

    let updatedWarning: Warning = {
      ...currentWarning,
      status: 'rectification',
      approvalFlow: {
        ...currentWarning.approvalFlow,
        currentStep: step as 0 | 1 | 2 | 3,
        steps: updatedSteps as any,
      },
    };

    get().saveAndPersist(updatedWarning);
  },

  startRectification: (warningId: string, plan?: string) => {
    const warning = get().warnings.find(w => w.id === warningId);
    if (!warning) return;

    const rect = warning.rectification || defaultRectificationPlan(warningId);
    const updatedRect: RectificationTracking = {
      ...rect,
      plan: plan || rect.plan,
      milestones: rect.milestones.map((m, i) => ({
        ...m,
        status: i === 0 ? 'in_progress' : m.status,
      })),
    };

    const updatedWarning: Warning = {
      ...warning,
      status: 'rectification',
      rectification: updatedRect,
    };

    get().saveAndPersist(updatedWarning);
  },

  updateMilestone: (warningId: string, milestoneId: string, status: RectificationMilestone['status'], remark?: string) => {
    const warning = get().warnings.find(w => w.id === warningId);
    if (!warning || !warning.rectification) return;

    const now = new Date();
    const updatedMilestones = warning.rectification.milestones.map(m =>
      m.id === milestoneId
        ? { ...m, status, remark, completedAt: status === 'completed' ? formatDate(now) : m.completedAt }
        : m
    );

    const updatedWarning: Warning = {
      ...warning,
      rectification: {
        ...warning.rectification,
        milestones: updatedMilestones,
      },
    };

    get().saveAndPersist(updatedWarning);
  },

  submitReview: (warningId: string, result: 'pass' | 'fail', comment: string) => {
    const warning = get().warnings.find(w => w.id === warningId);
    if (!warning || !warning.rectification) return;

    const now = new Date();
    const updatedWarning: Warning = {
      ...warning,
      status: result === 'pass' ? 'resolved' : 'rectification',
      rectification: {
        ...warning.rectification,
        reviewResult: result,
        reviewComment: comment,
        reviewDate: formatDate(now),
        reviewer: '当前用户',
        actualEndDate: result === 'pass' ? formatDate(now) : warning.rectification.actualEndDate,
      },
    };

    get().saveAndPersist(updatedWarning);
  },
}));
