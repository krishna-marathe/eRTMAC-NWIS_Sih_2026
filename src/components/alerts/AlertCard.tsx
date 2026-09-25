import { AlertTriangle, Info, AlertCircle, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AlertPriorityBadge } from '../ui/Badges';
import type { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  compact?: boolean;
}

const priorityIcon = {
  CRITICAL: AlertCircle,
  WARNING: AlertTriangle,
  INFO: Info,
};

const priorityBorder = {
  CRITICAL: 'border-l-red-500',
  WARNING: 'border-l-amber-500',
  INFO: 'border-l-blue-500',
};

export function AlertCard({ alert, onAcknowledge, compact = false }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = priorityIcon[alert.priority];

  if (compact) {
    return (
      <div className={`bg-surface-card border border-border-default border-l-2 ${priorityBorder[alert.priority]} rounded-lg p-3`}>
        <div className="flex items-start gap-2.5">
          <Icon size={14} className={
            alert.priority === 'CRITICAL' ? 'text-red-400 mt-0.5' :
            alert.priority === 'WARNING' ? 'text-amber-400 mt-0.5' : 'text-blue-400 mt-0.5'
          } />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-white truncate">{alert.title}</p>
              <AlertPriorityBadge priority={alert.priority} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.message}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
              <Clock size={10} />
              {formatTimestamp(alert.timestamp)}
              {alert.acknowledged && (
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <Check size={10} /> ACK
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-card border border-border-default border-l-2 ${priorityBorder[alert.priority]} rounded-lg overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            alert.priority === 'CRITICAL' ? 'bg-red-500/10' :
            alert.priority === 'WARNING' ? 'bg-amber-500/10' : 'bg-blue-500/10'
          }`}>
            <Icon size={16} className={
              alert.priority === 'CRITICAL' ? 'text-red-400' :
              alert.priority === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
            } />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
              <AlertPriorityBadge priority={alert.priority} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>

            <div className="flex items-center gap-3 mt-2.5">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock size={10} /> {formatTimestamp(alert.timestamp)}
              </span>
              {alert.depth && (
                <span className="text-[10px] text-slate-500">Depth: {alert.depth.toLocaleString()}m</span>
              )}
              {alert.formation && (
                <span className="text-[10px] text-slate-500">Fm: {alert.formation}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Evidence toggle ──────────────────────────────────── */}
        {(alert.evidenceItems?.length || alert.mitigationActions?.length) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-3 text-xs text-accent-400 hover:text-accent-300 font-medium cursor-pointer"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide' : 'Show'} Evidence & Mitigation
          </button>
        )}
      </div>

      {/* ── Expanded Evidence ──────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          {alert.evidenceItems && alert.evidenceItems.length > 0 && (
            <div className="bg-navy-800/50 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Why this alert was raised</p>
              <ul className="space-y-1.5">
                {alert.evidenceItems.map((item, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-accent-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alert.mitigationActions && alert.mitigationActions.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">Recommended Actions</p>
              <ul className="space-y-1.5">
                {alert.mitigationActions.map((action, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acknowledge button */}
          {!alert.acknowledged && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="w-full py-2 text-xs font-medium text-white bg-accent-600/20 hover:bg-accent-600/30 border border-accent-600/30 rounded-lg transition-colors cursor-pointer"
            >
              Acknowledge Alert
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
