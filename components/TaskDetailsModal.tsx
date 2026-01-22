import React, { useState } from 'react';
import { Task, Company, Collaborator } from '../types';
import { X, Check, CheckCircle2, CheckSquare, Building2, User, Calendar, Clock, MessageSquare, Save, Paperclip, FileText, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { storage } from '../lib/supabase';
import { Avatar } from './ui/Avatar';

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onToggleActivity: (taskId: string, index: number) => void;
    onUpdateNotes: (taskId: string, notes: string) => void;
    onUpdateTask?: (taskId: string, updates: Partial<Task>) => Promise<void>;
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
    onUpdateTask,
    collaborators,
    companies,
    currentUserId,
    isManager = false
}) => {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
        if (task) {
            setNotes(task.notes || '');
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const isImageFile = (url: string | undefined | null) => {
        if (!url) return false;
        const cleanUrl = url.trim().split(/[?#]/)[0].toLowerCase();
        return cleanUrl.endsWith('.jpg') ||
            cleanUrl.endsWith('.jpeg') ||
            cleanUrl.endsWith('.png') ||
            cleanUrl.endsWith('.webp') ||
            cleanUrl.endsWith('.gif') ||
            cleanUrl.endsWith('.svg') ||
            cleanUrl.endsWith('.avif') ||
            cleanUrl.endsWith('.bmp');
    };

    const completedCount = task.checklist?.filter(item => item.completed).length || 0;
    const totalCount = task.checklist?.length || 0;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const company = companies.find(c => c.id === task.companyId);
    const assignee = collaborators.find(c => c.id === task.assigneeId);
    const isAssignee = currentUserId && task.assigneeId && currentUserId.toLowerCase() === task.assigneeId.toLowerCase();
    const isCreator = currentUserId && task.creatorId && currentUserId.toLowerCase() === task.creatorId.toLowerCase();
    const canEditNotes = isAssignee || isCreator || isManager;

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !task) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("O arquivo é muito grande. O limite é 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `task-${task.id}-${Date.now()}-${cleanName}`;

            const { error } = await storage.upload('task-attachments', fileName, file);
            if (error) throw error;

            const publicUrl = storage.getPublicUrl('task-attachments', fileName);

            if (onUpdateTask) {
                await onUpdateTask(task.id, { attachmentUrl: publicUrl });
            } else {
                // Fallback if prop not provided
                const { error: dbError } = await storage.from('tasks').update({ attachment_url: publicUrl }).eq('id', task.id);
                if (dbError) throw dbError;
                alert("Arquivo anexado com sucesso!");
                window.location.reload();
            }
        } catch (err) {
            console.error("Erro no upload", err);
            alert("Falha ao enviar o arquivo.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
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

                        {/* Attachments Section */}
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-indigo-500" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        Documentos Anexados
                                    </h4>
                                </div>

                                {canEditNotes && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            disabled={isUploading}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                                        >
                                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
                                            {isUploading ? 'Enviando...' : 'Anexar Arquivo'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {task.attachmentUrl ? (
                                <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-slate-800/50 border-2 border-indigo-100/50 dark:border-slate-700 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm">
                                            {isImageFile(task.attachmentUrl) ? (
                                                <ImageIcon className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Arquivo Anexo</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Documento PDF ou Imagem</p>
                                        </div>
                                    </div>
                                    {isImageFile(task.attachmentUrl) ? (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewUrl(task.attachmentUrl!)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                                        >
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Visualizar
                                        </button>
                                    ) : (
                                        <a
                                            href={task.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Visualizar
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-[11px] font-medium text-slate-400">Nenhum arquivo anexado a esta tarefa.</p>
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

            {/* Image Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-slate-800">Visualização do Anexo</h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-2 bg-slate-50 flex items-center justify-center">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
