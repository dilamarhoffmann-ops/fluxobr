import React from 'react';
import { Task, Company, Collaborator } from '../types';
import { X, Check, CheckCircle2, CheckSquare, Building2, User, Calendar, Clock, MessageSquare, Save } from 'lucide-react';
import { Avatar } from './ui/Avatar';

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onToggleActivity: (taskId: string, index: number) => void;
    onUpdateNotes: (taskId: string, notes: string) => void;
    collaborators: Collaborator[];
    companies: Company[];
    currentUserId?: string;
    isManager?: boolean;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    isOpen,
    task,
    onClose,
    onToggleActivity,
    onUpdateNotes,
    collaborators,
    companies,
    currentUserId,
    isManager = false
}) => {
    const [notes, setNotes] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (task) {
            setNotes(task.notes || '');
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const completedCount = task.checklist?.filter(item => item.completed).length || 0;
    const totalCount = task.checklist?.length || 0;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const company = companies.find(c => c.id === task.companyId);
    const assignee = collaborators.find(c => c.id === task.assigneeId);
    const isAssignee = currentUserId === task.assigneeId;
    const canEditNotes = isAssignee || isManager;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não definida';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleSaveNotes = async () => {
        setIsSaving(true);
        await onUpdateNotes(task.id, notes);
        setIsSaving(false);
    };

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
                            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-lg whitespace-pre-wrap">{task.description}</p>
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
                    {/* Meta Information Grid */}
                    <div className="px-8 py-4 grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <Building2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Empresa</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {company?.name || 'Nenhuma'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <User className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Responsável</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Avatar name={assignee?.name} src={assignee?.avatar} size="xs" className="ring-0" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {assignee?.name || 'Não atribuído'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Data da Criação</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {formatDate(task.createdAt)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <Calendar className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Data do Vencimento</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {formatDate(task.dueDate)}
                            </p>
                        </div>
                    </div>


                    {/* Progress Bar Section */}
                    {totalCount > 0 && (
                        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        Progresso da Tarefa
                                    </span>
                                </div>
                                <span className={`text-xs font-bold ${progressPercentage === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                    {completedCount}/{totalCount} concluídas ({Math.round(progressPercentage)}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 p-0.5 shadow-inner">
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

                    {/* Notes Section (Observação) */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-amber-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Observação do Responsável
                                </h4>
                            </div>
                            {canEditNotes && notes !== (task.notes || '') && (
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                >
                                    <Save className="w-3 h-3" />
                                    {isSaving ? 'Salvando...' : 'Salvar Nota'}
                                </button>
                            )}
                        </div>
                        {canEditNotes ? (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Adicione observações sobre o andamento desta tarefa..."
                                className="w-full min-h-24 p-4 bg-amber-50/30 dark:bg-slate-800/50 border-2 border-amber-100/50 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-all resize-y"
                            />
                        ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">
                                    {task.notes || 'Nenhuma observação registrada pelo responsável.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Checklist as Tasks */}
                    <div className="p-8">
                        {task.checklist && task.checklist.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        Checklist de Atividades
                                    </h4>
                                </div>

                                {task.checklist.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => onToggleActivity(task.id, index)}
                                        className={`group flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${item.completed
                                            ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-800/50 grayscale-[0.5] opacity-80'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed
                                            ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200'
                                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 group-hover:border-indigo-500 group-hover:rotate-12'
                                            }`}>
                                            {item.completed && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold transition-all whitespace-pre-wrap ${item.completed
                                                ? 'text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500/50'
                                                : 'text-slate-800 dark:text-slate-100'
                                                }`}>
                                                {item.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma tarefa listada no checklist.</h5>
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
