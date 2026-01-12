
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
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-start justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div>
      <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 font-heading">{value}</h3>
      {trend && <p className="text-xs text-emerald-600 mt-3 font-bold flex items-center gap-1">
         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> {trend}
      </p>}
    </div>
    <div className={`p-4 rounded-xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
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
        color="bg-gradient-to-br from-blue-500 to-blue-600"
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
