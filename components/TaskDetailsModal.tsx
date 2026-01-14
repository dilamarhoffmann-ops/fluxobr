import React from 'react';
import { X, Check, CheckCircle2, CheckSquare } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onToggleActivity: (taskId: string, index: number) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    isOpen,
    task,
    onClose,
    onToggleActivity
}) => {
    if (!isOpen || !task) return null;

    const completedCount = task.checklist?.filter(item => item.completed).length || 0;
    const totalCount = task.checklist?.length || 0;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-purple-700 px-8 py-6 border-b border-white/10 flex justify-between items-start sticky top-0 z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-white/20 text-white border border-white/30`}>
                                {task.priority}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 leading-tight">{task.title}</h3>
                        {task.description && (
                            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-lg">{task.description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-all ml-4 p-2 hover:bg-white/10 rounded-xl"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Progress Bar Section */}
                    {totalCount > 0 && (
                        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        Progresso da Tarefa
                                    </span>
                                </div>
                                <span className={`text-sm font-bold ${progressPercentage === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                    {completedCount} de {totalCount} concluídas ({Math.round(progressPercentage)}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 p-1 shadow-inner">
                                <div
                                    className={`h-full transition-all duration-700 ease-out rounded-full shadow-lg ${progressPercentage === 100
                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                        }`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Checklist as Tasks */}
                    <div className="p-8">
                        {task.checklist && task.checklist.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                        Checklist de Atividades
                                    </h4>
                                </div>

                                {task.checklist.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => onToggleActivity(task.id, index)}
                                        className={`group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${item.completed
                                            ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-800/50 grayscale-[0.5] opacity-80'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {/* Checkbox Icon */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${item.completed
                                            ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-none animate-bounce-short'
                                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 group-hover:border-indigo-500 group-hover:rotate-12'
                                            }`}>
                                            {item.completed && <Check className="w-5 h-5 text-white stroke-[4]" />}
                                        </div>

                                        {/* Activity Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base font-bold transition-all ${item.completed
                                                ? 'text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500/50'
                                                : 'text-slate-800 dark:text-slate-100'
                                                }`}>
                                                {item.title}
                                            </p>
                                        </div>

                                        {/* Completion Indicator */}
                                        <div className={`transition-all duration-300 ${item.completed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                                            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                Finalizado
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-slate-300" />
                                </div>
                                <h5 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma tarefa listada</h5>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                                    Esta tarefa principal não possui atividades pendentes no checklist.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center sticky bottom-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Atual</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${task.status === 'Concluído' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                            <span className="font-bold text-slate-800 dark:text-slate-100">{task.status}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl transition-all active:scale-95"
                    >
                        Fechar Visualização
                    </button>
                </div>
            </div>
        </div>
    );
};
