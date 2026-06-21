import { create } from 'zustand';
import type { Warning } from '../types';
import { mockWarnings } from '../mock/data';

interface WarningState {
  warnings: Warning[];
  currentWarning: Warning | null;
  loading: boolean;
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

  fetchWarnings: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ warnings: mockWarnings, loading: false });
  },

  fetchWarningDetail: async (id: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const warning = mockWarnings.find((w) => w.id === id) || null;
    set({ currentWarning: warning, loading: false });
  },

  approveStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning, warnings } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedWarning: Warning = {
      ...currentWarning,
      status: step === 3 ? 'resolved' : 'processing',
      approvalFlow: {
        ...currentWarning.approvalFlow,
        currentStep: (step as 0 | 1 | 2 | 3) + 1 > 3 ? 3 : ((step + 1) as 0 | 1 | 2 | 3),
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

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },

  rejectStep: (step: 1 | 2 | 3, comment: string) => {
    const { currentWarning, warnings } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedWarning: Warning = {
      ...currentWarning,
      status: 'pending',
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

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },

  submitRectificationPlan: (step: 1 | 2 | 3, plan: string) => {
    const { currentWarning, warnings } = get();
    if (!currentWarning) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const rectificationStep = {
      step: step + 0.5,
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

    const updatedWarning: Warning = {
      ...currentWarning,
      status: 'processing',
      approvalFlow: {
        ...currentWarning.approvalFlow,
        currentStep: step as 0 | 1 | 2 | 3,
        steps: updatedSteps as any,
      },
    };

    const updatedWarnings = warnings.map((w) =>
      w.id === currentWarning.id ? updatedWarning : w
    );

    set({ currentWarning: updatedWarning, warnings: updatedWarnings });
  },
}));
