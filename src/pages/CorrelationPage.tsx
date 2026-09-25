import { GitCompareArrows } from 'lucide-react';
import { EmptyState } from '../components/ui';

export function CorrelationPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="bg-surface-card border border-border-default rounded-xl p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
            <GitCompareArrows size={20} className="text-accent-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Well Correlation</h1>
            <p className="text-sm text-slate-400">Depth & formation correlation across offset wells</p>
          </div>
        </div>
      </div>
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <EmptyState
          icon={GitCompareArrows}
          title="Well Correlation Module"
          description="Depth-based stratigraphic correlation and multi-well comparison will be available in Phase 2."
        />
      </div>
    </div>
  );
}
