import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RankingItem } from '@/types';

interface RankingListProps {
  data: RankingItem[];
  title: string;
  unit?: string;
  onItemClick?: (item: RankingItem, index: number) => void;
}

const rankStyles: Record<number, {
  badge: string;
  text: string;
  ring: string;
  glow: string;
}> = {
  1: {
    badge: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-950',
    text: 'text-amber-400',
    ring: 'ring-amber-400/30',
    glow: 'shadow-amber-400/20',
  },
  2: {
    badge: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800',
    text: 'text-slate-300',
    ring: 'ring-slate-400/30',
    glow: 'shadow-slate-400/20',
  },
  3: {
    badge: 'bg-gradient-to-br from-orange-400 to-amber-600 text-orange-950',
    text: 'text-orange-400',
    ring: 'ring-orange-400/30',
    glow: 'shadow-orange-400/20',
  },
};

export default function RankingList({ data, title, unit, onItemClick }: RankingListProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
      <div className="border-b border-white/5 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        <ul className="p-3 space-y-2">
          {data.map((item, index) => {
            const rank = index + 1;
            const style = rankStyles[rank];
            const percentage = (item.value / maxValue) * 100;
            const hasChange = item.change !== undefined && item.change !== null;
            const isUp = hasChange && item.change! > 0;
            const isDown = hasChange && item.change! < 0;
            const isClickable = !!onItemClick && !!item.institutionId;

            return (
              <li
                key={item.name}
                onClick={() => isClickable && onItemClick?.(item, index)}
                className={cn(
                  'group relative rounded-xl p-4 transition-all duration-200',
                  style
                    ? cn('bg-white/5 hover:bg-white/10 ring-1', style.ring, 'shadow-lg', style.glow)
                    : 'bg-white/[0.02] hover:bg-white/5',
                  isClickable && 'cursor-pointer hover:ring-2 hover:ring-blue-400/50'
                )}
              >
                {style && (
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b',
                      rank === 1 && 'from-yellow-400 to-amber-500',
                      rank === 2 && 'from-slate-300 to-slate-400',
                      rank === 3 && 'from-orange-400 to-amber-600'
                    )}
                  />
                )}

                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-bold text-sm',
                    style ? style.badge : 'bg-slate-800 text-slate-400'
                  )}>
                    {rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className={cn(
                        'font-medium truncate',
                        style ? cn(style.text, 'font-semibold') : 'text-white/90'
                      )}>
                        {item.name}
                      </p>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {hasChange && (
                          <span className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-semibold',
                            isUp && 'text-emerald-400',
                            isDown && 'text-red-400',
                            !isUp && !isDown && 'text-slate-500'
                          )}>
                            {isUp && <ArrowUpRight className="h-3.5 w-3.5" />}
                            {isDown && <ArrowDownRight className="h-3.5 w-3.5" />}
                            {!isUp && !isDown && <Minus className="h-3.5 w-3.5" />}
                            {Math.abs(item.change!)}%
                          </span>
                        )}

                        <span className={cn(
                          'font-mono text-sm font-bold tabular-nums',
                          style ? style.text : 'text-white'
                        )}>
                          {item.value.toLocaleString()}
                          {unit && <span className="text-xs text-slate-400 ml-1 font-normal">{unit}</span>}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/50">
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out',
                          rank === 1 && 'bg-gradient-to-r from-yellow-500 to-amber-400',
                          rank === 2 && 'bg-gradient-to-r from-slate-400 to-slate-300',
                          rank === 3 && 'bg-gradient-to-r from-orange-500 to-amber-400',
                          rank > 3 && 'bg-gradient-to-r from-blue-500 to-blue-400'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
