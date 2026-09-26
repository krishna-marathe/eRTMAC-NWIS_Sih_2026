import { Activity, Gauge, TrendingUp, Zap, Droplets, RotateCw, Weight, Waves, BarChart3, ArrowDownRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader, MetricCard } from '../components/ui';
import { StatusBadge } from '../components/ui/Badges';
import { parameterTimeSeries } from '../data/mockData';

export function LiveWellPage() {
  const { activeWell, currentParameters } = useWellContext();

  const chartData = parameterTimeSeries.map((p) => ({
    depth: p.depth,
    torque: p.torque,
    rop: p.rop,
    wob: p.wob,
    rpm: p.rpm,
    ecd: p.ecd,
  }));

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* ── Well Header ─────────────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Drilling Parameters — Demo</h1>
                <StatusBadge status={activeWell.status} />
              </div>
              <p className="text-sm text-slate-400">{activeWell.name} — Simulated drilling data for prototype demonstration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">SIMULATED DATA</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-400 text-center">
        <strong>Prototype demonstration:</strong> All drilling measurements shown are synthetic demo data. No live rig sensor or eRTMAC connection is active.
      </div>

      {/* ── Parameters Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Depth" value={currentParameters.depth.toLocaleString()} unit="m" icon={ArrowDownRight} accent="info" />
        <MetricCard label="ROP" value={currentParameters.rop} unit="m/hr" icon={TrendingUp} accent="success" trend="down" trendValue="1.8 over 80m" />
        <MetricCard label="WOB" value={currentParameters.wob} unit="klbs" icon={Weight} accent="default" />
        <MetricCard label="RPM" value={currentParameters.rpm} unit="rpm" icon={RotateCw} accent="default" />
        <MetricCard label="Torque" value={currentParameters.torque} unit="kN·m" icon={Zap} accent="warning" trend="up" trendValue="2.7 over 80m" />
        <MetricCard label="Mud Flow" value={currentParameters.mudFlow} unit="L/min" icon={Droplets} accent="default" />
        <MetricCard label="Mud Weight" value={currentParameters.mudWeight} unit="ppg" icon={Waves} accent="default" />
        <MetricCard label="Pressure" value={currentParameters.pressure.toLocaleString()} unit="psi" icon={Gauge} accent="default" />
        <MetricCard label="ECD" value={currentParameters.ecd} unit="ppg" icon={BarChart3} accent="default" />
        <MetricCard label="Hook Load" value={currentParameters.hookLoad} unit="klbs" icon={Activity} accent="default" />
      </div>

      {/* ── Torque & ROP Chart ──────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader title="Torque vs Depth" subtitle="Torque trend with stuck-pipe alert threshold" icon={Zap} />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="depth" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[10, 20]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' }}
              />
              <ReferenceLine y={16} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Alert Threshold', position: 'right', fill: '#ef4444', fontSize: 10 }} />
              <Line type="monotone" dataKey="torque" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Torque (kN·m)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROP & WOB Chart ─────────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader title="ROP & WOB vs Depth" subtitle="Drilling efficiency trend" icon={TrendingUp} />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="depth" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="rop" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 4 }} name="ROP (m/hr)" />
              <Line yAxisId="right" type="monotone" dataKey="wob" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 4 }} name="WOB (klbs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
