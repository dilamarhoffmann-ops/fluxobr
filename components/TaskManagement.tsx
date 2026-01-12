
import React, { useState } from 'react';
import { Task, Collaborator, TaskStatus, TaskPriority, Company, FAQItem } from '../types';
import { Filter, Search, User, Calendar, PlusCircle, Trash2, Clock, Building2, HelpCircle, Edit2 } from 'lucide-react';
import { FAQViewModal } from './FAQViewModal';

interface TaskManagementProps {
  tasks: Task[];
  collaborators: Collaborator[];
  companies: Company[];
  faqs?: FAQItem[]; // Add faqs prop
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  isManager: boolean;
  onOpenCreateModal: () => void;
  hideCompanyFilter?: boolean;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ 
  tasks, 
  collaborators,
  companies, 
  faqs = [], // Default to empty array
  onUpdateStatus,
  onDeleteTask,
  onEditTask,
  isManager,
  onOpenCreateModal,
  hideCompanyFilter = false
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for viewing FAQ details
  const [viewingFaq, setViewingFaq] = useState<FAQItem | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;
    const matchesCompany = hideCompanyFilter || filterCompany === 'all' || task.companyId === filterCompany;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesAssignee && matchesSearch && matchesCompany;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'text-red-600 bg-red-50 border-red-200';
      case TaskPriority.HIGH: return 'text-orange-600 bg-orange-50 border-orange-200';
      case TaskPriority.MEDIUM: return 'text-blue-600 bg-blue-50 border-blue-200';
      case TaskPriority.LOW: return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-emerald-100 text-emerald-800';
      case TaskStatus.BLOCKED: return 'bg-red-100 text-red-800';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case TaskStatus.REVIEW: return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const calculateDuration = (start?: string, end?: string): string => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    if (diffMs < 0) return '-';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col relative">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
             <h3 className="text-xl font-bold text-slate-800">Gerenciamento de Tarefas</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
             <div className="relative flex-grow xl:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                className="w-full xl:w-48 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {!hideCompanyFilter && (
              <div className="relative flex-grow xl:flex-grow-0">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="w-full pl-9 pr-8 py-2 border border-slate-700 rounded-lg text-sm appearance-none bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  <option value="all">Todas as Empresas</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-grow xl:flex-grow-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-8 py-2 border border-slate-700 rounded-lg text-sm appearance-none bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-grow xl:flex-grow-0">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-8 py-2 border border-slate-700 rounded-lg text-sm appearance-none bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="all">Todos os Responsáveis</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

             {isManager && (
               <button 
                 onClick={onOpenCreateModal}
                 className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 whitespace-nowrap ml-2"
               >
                 <PlusCircle className="w-4 h-4" /> Nova Tarefa
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs sticky top-0 bg-slate-50 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4">Tarefa</th>
              <th className="px-6 py-4">Responsável</th>
              {!hideCompanyFilter && <th className="px-6 py-4">Empresa</th>}
              <th className="px-6 py-4">Prazo</th>
              <th className="px-6 py-4">Status</th>
              {isManager && <th className="px-6 py-4 text-center">Duração</th>}
              {isManager && <th className="px-6 py-4 text-right">Ação</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length > 0 ? filteredTasks.map((task) => {
              const assignee = collaborators.find(c => c.id === task.assigneeId);
              const company = companies.find(c => c.id === task.companyId);
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
              const duration = calculateDuration(task.startedAt, task.completedAt);
              
              // Find related FAQ (by ID)
              const relatedFaq = task.faqId ? faqs.find(f => f.id === task.faqId) : null;

              return (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-start gap-2">
                      <p className="font-medium text-slate-900 truncate" title={task.title}>{task.title}</p>
                      {relatedFaq && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingFaq(relatedFaq);
                          }}
                          className="text-indigo-400 hover:text-indigo-600 transition-colors mt-0.5"
                          title="Ver FAQ Relacionado"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img src={assignee?.avatar} alt={assignee?.name} className="w-6 h-6 rounded-full" />
                      <span className="text-slate-700 truncate">{assignee?.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  {!hideCompanyFilter && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${company?.logo || 'bg-slate-400'}`}></div>
                        <span className="text-slate-600 truncate">{company?.name || 'N/A'}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`text-xs border rounded px-2 py-1 focus:outline-none cursor-pointer font-medium ${getStatusColor(task.status)} border-transparent hover:border-slate-300`}
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                    >
                      {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  
                  {isManager && (
                    <td className="px-6 py-4 text-center">
                       {task.status === TaskStatus.DONE && task.completedAt && task.startedAt ? (
                         <div className="flex items-center justify-center gap-1 text-slate-500" title={`Início: ${new Date(task.startedAt).toLocaleString()} - Fim: ${new Date(task.completedAt).toLocaleString()}`}>
                           <Clock className="w-3 h-3" />
                           {duration}
                         </div>
                       ) : (
                         <span className="text-slate-300">-</span>
                       )}
                    </td>
                  )}

                  {isManager && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {onEditTask && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar tarefa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={isManager ? (hideCompanyFilter ? 6 : 7) : (hideCompanyFilter ? 4 : 5)} className="px-6 py-8 text-center text-slate-400">
                  Nenhuma tarefa encontrada com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* FAQ Detail Modal */}
      <FAQViewModal 
        isOpen={!!viewingFaq}
        onClose={() => setViewingFaq(null)}
        faq={viewingFaq}
      />
    </div>
  );
};
