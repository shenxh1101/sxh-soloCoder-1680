import { create } from 'zustand';
import type { Warning, WarningApprovalStatus } from '../types';
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
  
  let approvalStatus: WarningApprovalStatus = 'pending';
  
  const hasRejected = steps.some(s => s.status === 'rejected');
  if (hasRejected) {
    approvalStatus = 'rejected';
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
  if (hasRectification && !hasRejected && approvalStatus !== 'province_approved') {
    approvalStatus = 'rectification_submitted';
  }

  return { ...warning, approvalStatus };
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
      warnings = storedWarnings;
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

  approveStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning, warnings } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nextStep = step < 3 ? (step + 1) : 4;

    let updatedWarning: Warning = {
      ...currentWarning,
      status: step === 3 ? 'resolved' : 'processing',
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

    updatedWarning = updateApprovalStatus(updatedWarning);

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    saveWarningsToStorage(updatedWarnings);
    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },

  rejectStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning, warnings } = get();
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

    updatedWarning = updateApprovalStatus(updatedWarning);

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    saveWarningsToStorage(updatedWarnings);
    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },

  submitRectificationPlan: (step: 1 | 2 | 3, plan: string) => {
    const { currentWarning, warnings } = get();
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

    updatedWarning = updateApprovalStatus(updatedWarning);

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    saveWarningsToStorage(updatedWarnings);
    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },
}));
