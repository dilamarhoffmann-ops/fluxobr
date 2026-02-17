
import React from 'react';
import { LucideIcon, CheckCircle2, AlertOctagon, Clock, Activity } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 flex items-start justify-between hover:shadow-2xl hover:shadow-[var(--primary-blue)]/5 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-blue)] opacity-[0.03] rounded-full blur-3xl -mr-10 -mt-10"></div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-heading tracking-tight">{value}</h3>
      {trend && <p className={`text-xs mt-3 font-extrabold flex items-center gap-1.5 ${trend.includes('Atenção') ? 'text-red-500' : 'text-emerald-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${trend.includes('Atenção') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span> {trend}
      </p>}
    </div>
    <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-blue-500/10 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

interface MetricsRowProps {
  metrics: DashboardMetrics;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total de Tarefas"
        value={metrics.totalTasks}
        icon={Activity}
        color="bg-gradient-to-br from-[var(--primary-blue)] to-[var(--deep-blue)]"
        trend="Ativas neste sprint"
      />
      <MetricCard
        title="Taxa de Conclusão"
        value={`${metrics.completionRate.toFixed(0)}%`}
        icon={CheckCircle2}
        color="bg-gradient-to-br from-emerald-400 to-emerald-600"
        trend="+5% vs semana anterior"
      />
      <MetricCard
        title="Tarefas Bloqueadas"
        value={metrics.blockedTasks}
        icon={AlertOctagon}
        color="bg-gradient-to-br from-red-400 to-red-600"
        trend={metrics.blockedTasks > 0 ? "Atenção Requerida" : "Fluxo Normal"}
      />
      <MetricCard
        title="Tarefas Atrasadas"
        value={metrics.overdueTasks}
        icon={Clock}
        color="bg-gradient-to-br from-amber-400 to-amber-500"
        trend="Prioridade Alta"
      />
    </div>
  );
};
