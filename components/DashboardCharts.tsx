
import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Task, Collaborator, TaskStatus } from '../types';

interface DashboardChartsProps {
  tasks: Task[];
  collaborators: Collaborator[];
}

const COLORS = {
  [TaskStatus.DONE]: '#10b981', // Emerald 500
  [TaskStatus.IN_PROGRESS]: '#3b82f6', // Blue 500
  [TaskStatus.PENDING]: '#94a3b8', // Slate 400
  [TaskStatus.BLOCKED]: '#ef4444', // Red 500
  [TaskStatus.REVIEW]: '#f59e0b', // Amber 500
};

// Custom Tooltip to show details and percentage
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.Total;
    const completed = data[TaskStatus.DONE] || 0;
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
           {data[TaskStatus.IN_PROGRESS] > 0 && (
             <div className="flex justify-between gap-4">
               <span className="text-blue-500">Em Andamento:</span>
               <span className="font-semibold text-blue-500">{data[TaskStatus.IN_PROGRESS]}</span>
             </div>
           )}
           {data[TaskStatus.BLOCKED] > 0 && (
             <div className="flex justify-between gap-4">
               <span className="text-red-500">Bloqueadas:</span>
               <span className="font-semibold text-red-500">{data[TaskStatus.BLOCKED]}</span>
             </div>
           )}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ tasks, collaborators }) => {
  
  // Prepare Data for Pie Chart (Status Distribution)
  const statusData = Object.values(TaskStatus).map(status => ({
    name: status,
    value: tasks.filter(t => t.status === status).length
  })).filter(d => d.value > 0);

  // Prepare Data for Bar Chart (Workload per Collaborator)
  const workloadData = collaborators.map(collab => {
    const userTasks = tasks.filter(t => t.assigneeId === collab.id);
    return {
      name: collab.name.split(' ')[0], // First name only for chart
      Total: userTasks.length,
      [TaskStatus.DONE]: userTasks.filter(t => t.status === TaskStatus.DONE).length,
      [TaskStatus.IN_PROGRESS]: userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      [TaskStatus.BLOCKED]: userTasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição de Status</h3>
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
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Carga de Trabalho por Colaborador</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={workloadData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend />
              
              {/* Total Assigned */}
              <Bar dataKey="Total" fill="#cbd5e1" name="Total Atribuído" radius={[4, 4, 0, 0]} barSize={20} />
              
              {/* Completed Tasks - Added for percentage visibility context */}
              <Bar dataKey={TaskStatus.DONE} fill={COLORS[TaskStatus.DONE]} name="Concluído" radius={[4, 4, 0, 0]} barSize={20} />
              
              {/* Blocked Tasks */}
              <Bar dataKey={TaskStatus.BLOCKED} fill={COLORS[TaskStatus.BLOCKED]} name="Bloqueado" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
