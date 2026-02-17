
import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Task, Collaborator, TaskStatus, Company } from '../types';

interface DashboardChartsProps {
  tasks: Task[];
  collaborators: Collaborator[];
  companies: Company[];
}

const COLORS = {
  [TaskStatus.PENDING]: '#2563eb',   // bg-blue-600
  [TaskStatus.IN_PROGRESS]: '#16a34a', // bg-green-600
  [TaskStatus.REVIEW]: '#facc15',      // bg-yellow-400
  [TaskStatus.DONE]: '#06b6d4',        // bg-cyan-500
  [TaskStatus.ARCHIVED]: '#64748b',    // bg-slate-500
};

// Custom Tooltip to show details and percentage
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.total;
    const completed = data.completed;
    const percentage = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg outline-none z-50">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Total Atribuído:</span>
            <span className="font-semibold text-slate-700">{total}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-600 font-medium">Concluídas:</span>
            <span className="font-bold text-emerald-600">{completed} ({percentage}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ tasks, collaborators, companies }) => {

  // 1. Status Distribution
  const statusData = Object.values(TaskStatus).map(status => ({
    name: status,
    value: tasks.filter(t => t.status === status).length
  })).filter(d => d.value > 0);

  // 2. Progress per Company
  const companyProgressData = companies.map(company => {
    const companyTasks = tasks.filter(t => t.companyId === company.id);
    const completed = companyTasks.filter(t => t.status === TaskStatus.DONE).length;
    const total = companyTasks.length;
    return {
      name: company.name,
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }).filter(c => c.total > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // 3. Progress per Member
  const memberProgressData = collaborators.map(collab => {
    const memberTasks = tasks.filter(t => t.assigneeId === collab.id);
    const completed = memberTasks.filter(t => t.status === TaskStatus.DONE).length;
    const total = memberTasks.length;
    return {
      name: collab.name.split(' ').slice(0, 2).join(' '),
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }).filter(m => m.total > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">Distribuição de Status</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as TaskStatus]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress List - Companies & Members */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">Performance do Time</h3>

          <div className="space-y-8">
            {/* Progress per Company */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Progresso por Empresa</h4>
              <div className="space-y-4">
                {companyProgressData.slice(0, 5).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress per Member */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Eficiência por Membro</h4>
              <div className="space-y-4">
                {memberProgressData.slice(0, 5).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">{item.completed}/{item.total} tarefas</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Production Bar Chart (Full View of Workload) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">Volume de Trabalho por Membro</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={memberProgressData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#94a3b8" name="Total Atribuído" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="completed" fill="#10b981" name="Concluídas" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
