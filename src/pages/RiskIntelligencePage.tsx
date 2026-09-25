import { ShieldAlert } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { RiskBadge } from '../components/ui/Badges';

export function RiskIntelligencePage() {
  const { risks } = useWellContext();

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader
          title="Risk Intelligence"
          subtitle="AI-correlated risk assessments based on offset well analysis"
          icon={ShieldAlert}
        />
      </div>

      <div className="space-y-4">
        {risks.map((risk) => (
          <div key={risk.id} className="bg-surface-card border border-border-default rounded-xl p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white">{risk.riskType}</h3>
                  <RiskBadge level={risk.riskLevel} />
                </div>
                <p className="text-sm text-slate-400">{risk.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</p>
                <p className="text-xl font-bold text-white">{risk.confidence}%</p>
              </div>
            </div>

            {/* Depth range */}
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-4 border-b border-border-subtle">
              <span>Depth Range: <span className="text-white font-medium">{risk.affectedDepthRange[0].toLocaleString()}–{risk.affectedDepthRange[1].toLocaleString()}m</span></span>
              <span>Formation: <span className="text-white font-medium">{risk.formation}</span></span>
              <span>Matching Wells: <span className="text-white font-medium">{risk.matchingWells.join(', ')}</span></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evidence */}
              <div className="bg-navy-800/40 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Why this risk is assessed
                </p>
                <ul className="space-y-2">
                  {risk.evidenceItems.map((item, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-accent-400 mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigation */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                  Recommended Mitigations
                </p>
                <ul className="space-y-2">
                  {risk.mitigationActions.map((action, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
