import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import type { MetricsCardColor } from '@/types';

interface MetricsCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  color?: MetricsCardColor;
  loading?: boolean;
}

const colorVariants: Record<MetricsCardColor, {
  bg: string;
  accent: string;
  ring: string;
  progressFrom: string;
  progressTo: string;
}> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950',
    accent: 'text-blue-300',
    ring: 'ring-blue-500/30',
    progressFrom: 'from-blue-400',
    progressTo: 'to-blue-600',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950',
    accent: 'text-purple-300',
    ring: 'ring-purple-500/30',
    progressFrom: 'from-purple-400',
    progressTo: 'to-purple-600',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950',
    accent: 'text-emerald-300',
    ring: 'ring-emerald-500/30',
    progressFrom: 'from-emerald-400',
    progressTo: 'to-emerald-600',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-950',
    accent: 'text-orange-300',
    ring: 'ring-orange-500/30',
    progressFrom: 'from-orange-400',
    progressTo: 'to-orange-600',
  },
};

export default function MetricsCard({
  title,
  value,
  suffix = '',
  trend,
  trendLabel,
  color = 'blue',
  loading = false,
}: MetricsCardProps) {
  const animatedValue = useCountUp({ target: value, duration: 2000 });
  const variant = colorVariants[color];
  const progressPercent = value > 0 ? Math.min(100, Math.max(0, (value / (value * 1.2)) * 100)) : 0;
  const isTrendUp = trend !== undefined && trend >= 0;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  if (loading) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br from-slate-800 to-slate-900',
        'animate-pulse'
      )}>
        <div className="h-4 w-24 rounded bg-slate-700 mb-4" />
        <div className="h-10 w-32 rounded bg-slate-700 mb-4" />
        <div className="h-4 w-20 rounded bg-slate-700" />
      </div>
    );
  }

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl p-6',
      variant.bg,
      'transition-all duration-300 ease-out',
      'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30',
      'ring-1 ring-white/10'
    )}>
      <div className="absolute -right-8 -top-8 h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
            className={cn('bg-gradient-to-r', variant.progressFrom, variant.progressTo)}
            style={{
              stroke: 'url(#progressGradient)',
              transition: 'stroke-dashoffset 2s ease-out',
            }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="1" className={variant.accent} />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10">
        <p className={cn('text-sm font-medium mb-3', variant.accent)}>{title}</p>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="font-serif text-4xl font-bold text-white tracking-tight">
            {formatNumber(animatedValue)}
          </span>
          {suffix && (
            <span className={cn('text-lg font-medium', variant.accent)}>{suffix}</span>
          )}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              isTrendUp
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            )}>
              {isTrendUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-white/60">{trendLabel}</span>
            )}
          </div>
        )}
      </div>

      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100',
        'transition-opacity duration-300',
        'pointer-events-none'
      )}>
        <div className={cn(
          'absolute -inset-px rounded-2xl ring-2',
          variant.ring
        )} />
      </div>
    </div>
  );
}
