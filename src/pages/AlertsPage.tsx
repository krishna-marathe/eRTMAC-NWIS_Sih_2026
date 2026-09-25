import { Bell } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { AlertCard } from '../components/alerts/AlertCard';

export function AlertsPage() {
  const { alerts, acknowledgeAlert } = useWellContext();

  const critical = alerts.filter((a) => a.priority === 'CRITICAL');
  const warning = alerts.filter((a) => a.priority === 'WARNING');
  const info = alerts.filter((a) => a.priority === 'INFO');

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader
          title="Alerts & Notifications"
          subtitle={`${alerts.filter((a) => !a.acknowledged).length} unacknowledged of ${alerts.length} total`}
          icon={Bell}
        />
      </div>

      {critical.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Critical</h3>
          <div className="space-y-3">
            {critical.map((a) => (
              <AlertCard key={a.id} alert={a} onAcknowledge={acknowledgeAlert} />
            ))}
          </div>
        </div>
      )}

      {warning.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Warning</h3>
          <div className="space-y-3">
            {warning.map((a) => (
              <AlertCard key={a.id} alert={a} onAcknowledge={acknowledgeAlert} />
            ))}
          </div>
        </div>
      )}

      {info.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Informational</h3>
          <div className="space-y-3">
            {info.map((a) => (
              <AlertCard key={a.id} alert={a} onAcknowledge={acknowledgeAlert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
