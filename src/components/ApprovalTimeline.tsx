import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApprovalStep } from '@/types';

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  currentStep: number;
}

export default function ApprovalTimeline({ steps, currentStep }: ApprovalTimelineProps) {
  const getStatusStyles = (step: ApprovalStep, index: number) => {
    const isCompleted = step.status === 'completed' || index < currentStep;
    const isCurrent = step.status === 'current' || index === currentStep;

    if (isCompleted) {
      return {
        node: 'bg-emerald-500 ring-4 ring-emerald-500/20',
        nodeIcon: 'text-white',
        line: 'bg-emerald-500',
        label: 'text-emerald-400',
        cardBg: 'bg-emerald-500/10 border-emerald-500/30',
        cardText: 'text-emerald-300',
      };
    }

    if (isCurrent) {
      return {
        node: 'bg-blue-500 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/50 animate-pulse',
        nodeIcon: 'text-white',
        line: 'bg-slate-700',
        label: 'text-blue-400',
        cardBg: 'bg-blue-500/10 border-blue-500/40',
        cardText: 'text-blue-300',
      };
    }

    return {
      node: 'bg-slate-700 ring-4 ring-slate-700/30',
      nodeIcon: 'text-slate-500',
      line: 'bg-slate-700',
      label: 'text-slate-500',
      cardBg: 'bg-slate-800/50 border-slate-700/50',
      cardText: 'text-slate-400',
    };
  };

  return (
    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6">
      <div className="relative overflow-x-auto pb-4 custom-scrollbar-x">
        <div className="flex min-w-max">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const styles = getStatusStyles(step, index);
            const isCompleted = step.status === 'completed' || index < currentStep;
            const isCurrent = step.status === 'current' || index === currentStep;

            return (
              <div key={step.id} className="relative flex">
                {!isLast && (
                  <div className="absolute top-6 left-12 h-0.5 w-32 -translate-y-1/2">
                    <div className={cn(
                      'h-full w-full',
                      styles.line,
                      (isCompleted || isCurrent) ? 'opacity-100' : 'opacity-50'
                    )} />
                  </div>
                )}

                <div className="flex w-56 flex-col items-center pr-8">
                  <div className="relative mb-4 z-10">
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300',
                      styles.node
                    )}>
                      {isCompleted ? (
                        <Check className={cn('h-6 w-6', styles.nodeIcon)} strokeWidth={3} />
                      ) : (
                        <Clock className={cn('h-5 w-5', styles.nodeIcon)} />
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    'w-full rounded-xl border p-4 text-center transition-all duration-300',
                    styles.cardBg
                  )}>
                    <div className={cn(
                      'inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2',
                      isCompleted && 'bg-emerald-500/20 text-emerald-300',
                      isCurrent && 'bg-blue-500/20 text-blue-300',
                      !isCompleted && !isCurrent && 'bg-slate-700/50 text-slate-400'
                    )}>
                      {step.role}
                    </div>

                    <p className={cn(
                      'font-semibold text-sm mb-1',
                      isCompleted || isCurrent ? 'text-white' : 'text-slate-500'
                    )}>
                      {step.operator}
                    </p>

                    {step.time && (
                      <p className={cn('text-xs mb-2', styles.cardText)}>
                        {step.time}
                      </p>
                    )}

                    {step.opinion ? (
                      <p className={cn(
                        'text-xs leading-relaxed',
                        styles.cardText
                      )}>
                        {step.opinion}
                      </p>
                    ) : (
                      <p className={cn(
                        'text-xs italic',
                        !isCompleted && !isCurrent && 'text-slate-600',
                        isCurrent && 'text-blue-400/70'
                      )}>
                        {isCurrent ? '审批中...' : '待处理'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar-x::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-x::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar-x::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
