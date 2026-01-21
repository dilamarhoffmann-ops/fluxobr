
import React, { useState, useMemo } from 'react';
import { Task, Collaborator, TaskStatus, TaskPriority, Company, FAQItem } from '../types';
import { Filter, Search, User, Calendar, PlusCircle, Trash2, Clock, Building2, HelpCircle, Edit2, GripVertical, Check, Paperclip } from 'lucide-react';
import { FAQViewModal } from './FAQViewModal';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Avatar } from './ui/Avatar';

interface TaskManagementProps {
  tasks: Task[];
  collaborators: Collaborator[];
  companies: Company[];
  faqs?: FAQItem[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
  onToggleChecklistItem?: (taskId: string, index: number) => void;
  isManager: boolean;
  onOpenCreateModal: () => void;
  hideCompanyFilter?: boolean;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  collaborators,
  companies,
  faqs = [],
  onUpdateStatus,
  onDeleteTask,
  onEditTask,
  onViewTask,
  onToggleChecklistItem,
  isManager,
  onOpenCreateModal,
  hideCompanyFilter = false
}) => {
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFaq, setViewingFaq] = useState<FAQItem | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Se for um lembrete (possui data de lembrete), ele ignora o filtro de empresa 
    // e sempre aparece para os membros da equipe (regra de negócio solicitada).
    if (task.reminder) return matchesAssignee && matchesSearch;

    const matchesCompany = hideCompanyFilter || filterCompany === 'all' || task.companyId === filterCompany;
    return matchesAssignee && matchesSearch && matchesCompany;
  });

  const columns = [
    { id: TaskStatus.PENDING, title: 'PENDENTE', color: 'bg-blue-600', borderColor: 'bg-blue-600', textColor: 'text-white' },
    { id: TaskStatus.IN_PROGRESS, title: 'Em Andamento', color: 'bg-green-600', borderColor: 'bg-green-600', textColor: 'text-white' },
    { id: TaskStatus.REVIEW, title: 'Em Revisão', color: 'bg-yellow-400', borderColor: 'bg-yellow-400', textColor: 'text-slate-900' },
    { id: TaskStatus.DONE, title: 'Concluído', color: 'bg-cyan-500', borderColor: 'bg-cyan-500', textColor: 'text-white' },
    { id: TaskStatus.ARCHIVED, title: 'Arquivado', color: 'bg-slate-500', borderColor: 'bg-slate-500', textColor: 'text-white' },
  ];

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    columns.forEach(col => groups[col.id] = []);
    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    return groups;
  }, [filteredTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');

    // Bloqueio visual/UI adicional para não-gestores
    const task = tasks.find(t => t.id === taskId);
    const hasChecklist = task?.checklist && task.checklist.length > 0;

    // Somente gestores podem mover para CONCLUÍDO ou ARQUIVADO
    if (!isManager && (newStatus === TaskStatus.DONE || newStatus === TaskStatus.ARCHIVED)) {
      alert('Apenas gestores podem mover tarefas para "Concluído" ou "Arquivado".');
      return;
    }

    if (taskId) {
      onUpdateStatus(taskId, newStatus);
    }
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return { color: 'text-red-700 bg-red-100 border-red-200', dot: 'bg-red-500' };
      case TaskPriority.HIGH: return { color: 'text-orange-700 bg-orange-100 border-orange-200', dot: 'bg-orange-500' };
      case TaskPriority.MEDIUM: return { color: 'text-blue-700 bg-blue-100 border-blue-200', dot: 'bg-blue-500' };
      case TaskPriority.LOW: return { color: 'text-slate-700 bg-slate-100 border-slate-200', dot: 'bg-slate-400' };
      default: return { color: 'text-slate-600', dot: 'bg-slate-400' };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Filters Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {!hideCompanyFilter && (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer min-w-[160px]"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  <option value="all">Todas Empresas</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer min-w-[160px]"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="all">Responsáveis</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {isManager && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" /> Nova Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Kanban Scroll Area */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="inline-flex h-full gap-6 min-w-full p-1">
          {columns.map(column => (
            <div
              key={column.id}
              className="w-80 flex-shrink-0 flex flex-col rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 shadow-sm transition-colors duration-300"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`p-4 ${column.color} ${column.textColor} rounded-t-2xl shadow-md`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">
                      ({groupedTasks[column.id].length})
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm uppercase tracking-wider leading-none">{column.title}</h4>
                      {/* Badge "Somente Gestores" para Concluído e Arquivado */}
                      {(column.id === TaskStatus.DONE || column.id === TaskStatus.ARCHIVED) && (
                        <span className="text-[8px] font-black opacity-70 uppercase tracking-tighter mt-0.5">Apenas Gestores</span>
                      )}
                    </div>
                  </div>
                  {isManager && (
                    <button onClick={onOpenCreateModal} className="hover:scale-110 transition-transform">
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Task List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                <AnimatePresence>
                  {groupedTasks[column.id].map(task => {
                    const assignee = collaborators.find(c => c.id === task.assigneeId);
                    const company = companies.find(c => c.id === task.companyId);
                    const priorityInfo = getPriorityInfo(task.priority);

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onViewTask?.(task)}
                          className="bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-100 dark:border-slate-600 p-4 cursor-grab active:cursor-grabbing group hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-200 relative overflow-hidden"
                        >
                          {/* Status Border Tab */}
                          <div className={`absolute top-0 left-0 w-2 h-full ${column.borderColor}`}></div>

                          <div className="flex justify-between items-start mb-2 pl-2">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter ${priorityInfo.color}`}>
                              {task.priority}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isManager && onEditTask && (
                                <button onClick={(e) => { e.stopPropagation(); onEditTask(task); }} className="p-1 text-slate-400 hover:text-blue-500 rounded transition-colors bg-slate-50 dark:bg-slate-600">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isManager && (
                                <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors bg-slate-50 dark:bg-slate-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h5 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 pl-2 pr-4">{task.title}</h5>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-6 mb-3 pl-2 pr-2 leading-relaxed whitespace-pre-wrap">
                            {task.description}
                          </p>

                          {/* Checklist Section */}
                          {task.checklist && task.checklist.length > 0 && (
                            <div className="mb-4 pl-2 pr-2 space-y-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Atividades</span>
                                <span className="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">
                                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                                </span>
                              </div>
                              <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                {task.checklist.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 group/item cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); onToggleChecklistItem?.(task.id, idx); }}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-100' : 'border-slate-200 dark:border-slate-500 bg-white dark:bg-slate-800'}`}>
                                      {item.completed && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className={`text-[11px] transition-all font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                      {item.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-600/50 pl-2">
                            <div className="flex flex-col gap-1">
                              {company && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  <Building2 className="w-3 h-3" />
                                  {company.name}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {(() => {
                                  try {
                                    return new Date(task.dueDate).toLocaleDateString('pt-BR');
                                  } catch (e) {
                                    return 'Data inválida';
                                  }
                                })()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {task.faqId && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setViewingFaq(faqs.find(f => f.id === task.faqId) || null); }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                >
                                  <HelpCircle className="w-4 h-4" />
                                </button>
                              )}
                              {task.attachmentUrl && (
                                <a
                                  href={task.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors group/att"
                                  title="Ver anexo PDF"
                                >
                                  <Paperclip className="w-4 h-4" />
                                </a>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 max-w-[80px] truncate">
                                  {assignee?.name || 'Sem resp.'}
                                </span>
                                <Avatar name={assignee?.name} src={assignee?.avatar} size="sm" title={assignee?.name} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {groupedTasks[column.id].length === 0 && (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl m-2 opacity-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Solte aqui</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FAQViewModal
        isOpen={!!viewingFaq}
        onClose={() => setViewingFaq(null)}
        faq={viewingFaq}
      />
    </div>
  );
};
