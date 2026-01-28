import React, { useState } from 'react';
import { Task, Company, Collaborator } from '../types';
import { X, Check, CheckCircle2, CheckSquare, Building2, User, Calendar, Clock, MessageSquare, Save, Paperclip, FileText, Loader2, ExternalLink, Image as ImageIcon, ArrowRightLeft, History, Lock, Shield, Plus } from 'lucide-react';
import { storage, db } from '../lib/supabase';
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
    teams: string[];
    currentUserId?: string;
    isManager?: boolean;
    onTransferTask?: (taskId: string, receptorId: string, itemIndices: number[], transferData: any, mode: string) => Promise<void>;
    onEdit?: () => void;
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
    teams,
    currentUserId,
    isManager = false,
    onTransferTask,
    onEdit
}) => {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferMode, setTransferMode] = useState<'squad' | 'delegar' | 'devolver'>('squad');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');

    // Estados do formulário de transferência
    const [transferData, setTransferData] = useState({
        toId: '',
        deadline: '',
        projectName: '',
        transferDate: new Date().toISOString().split('T')[0]
    });
    const [selectedItemsForTransfer, setSelectedItemsForTransfer] = useState<number[]>([]);

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
    const canManageAttachments = isAssignee || isCreator || isManager;
    const canFullEditNotes = isCreator;
    const canAppendNotes = (isAssignee || isManager) && !isCreator;
    const canEditOrAppendNotes = canFullEditNotes || canAppendNotes;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não definida';
        const d = new Date(dateString);
        return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };


    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            if (canFullEditNotes) {
                await onUpdateNotes(task.id, notes);
            } else if (canAppendNotes && newNote.trim()) {
                const currentUser = collaborators.find(c => c.id === currentUserId);
                const userName = currentUser?.name || 'Usuário';
                const timestamp = new Date().toLocaleString('pt-BR');
                const signedNote = `\n\n[${userName} - ${timestamp}]:\n${newNote}`;
                const finalNotes = (task.notes || '') + signedNote;

                await onUpdateNotes(task.id, finalNotes);
                setNotes(finalNotes);
                setNewNote(''); // Clear input after save
            }
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
            alert("Erro ao salvar nota. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
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
                const { error: dbError } = await db.from('tasks').update({ attachment_url: publicUrl }).eq('id', task.id);
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-black/20 px-2 py-0.5 rounded border border-white/5">
                                    ID: {task.id.toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">{task.title}</h3>
                            {task.description && (
                                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mt-2 w-full">
                                    <p className="text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-wrap">{task.description}</p>
                                </div>
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

                                {canManageAttachments && (
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
                                    <div className="flex items-center gap-2">
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
                                        {canManageAttachments && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!window.confirm("Tem certeza que deseja excluir o anexo?")) return;

                                                    // Extrair nome do arquivo da URL se necessário, ou apenas limpar o campo no banco
                                                    // No Supabase Storage, precisaríamos do path. Aqui vamos apenas desvincular da tarefa.
                                                    // Se quiser deletar do Storage, precisaria parsear a URL.

                                                    try {
                                                        const fileName = task.attachmentUrl!.split('/').pop();
                                                        if (fileName) {
                                                            await storage.remove('task-attachments', [fileName]);
                                                        }

                                                        if (onUpdateTask) {
                                                            await onUpdateTask(task.id, { attachmentUrl: null });
                                                        } else {
                                                            const { error: dbError } = await db.from('tasks').update({ attachment_url: null }).eq('id', task.id);
                                                            if (dbError) throw dbError;
                                                            window.location.reload();
                                                        }
                                                        alert("Anexo removido com sucesso!");
                                                    } catch (err) {
                                                        console.error("Erro ao remover anexo:", err);
                                                        alert("Erro ao remover anexo.");
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm"
                                                title="Excluir Anexo"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : null}
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

                                    {task.checklist.map((item, index) => {
                                        const isLocked = item.completed && item.completedBy && currentUserId && item.completedBy !== currentUserId;

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => onToggleActivity(task.id, index)}
                                                className={`group flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${item.completed
                                                    ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-800/50 grayscale-[0.5] opacity-80'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:-translate-y-0.5'
                                                    } ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed
                                                    ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200'
                                                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 group-hover:border-indigo-500 group-hover:rotate-12'
                                                    }`}>
                                                    {item.completed ? (
                                                        isLocked ? <Lock className="w-3.5 h-3.5 text-white" /> : <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                                                    ) : null}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold transition-all whitespace-pre-wrap ${item.completed
                                                        ? 'text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500/50'
                                                        : 'text-slate-800 dark:text-slate-100'
                                                        }`}>
                                                        {item.title}
                                                    </p>
                                                    {item.completedByName && (
                                                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/50 font-medium">
                                                            Finalizado por: {item.completedByName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        {/* Observações / Resposta Section */}


                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-4 sticky bottom-0">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Atual</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${task.status === 'Concluído' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                <span className="font-bold text-slate-800 dark:text-slate-100">{task.status}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {task.status === 'Em Andamento' && (
                                <button
                                    onClick={() => {
                                        const pendingCount = task.checklist?.filter(i => !i.completed).length || 0;
                                        if (pendingCount === 0) return;
                                        setTransferData(prev => ({ ...prev, projectName: task.title }));
                                        setIsTransferring(true);
                                    }}
                                    disabled={(task.checklist?.filter(i => !i.completed).length || 0) === 0}
                                    className={`flex items-center gap-2 px-6 py-3 font-black rounded-2xl transition-all active:scale-95 ${((task.checklist?.filter(i => !i.completed).length || 0) === 0)
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                                        : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-100 dark:shadow-none'
                                        }`}
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    {(task.checklist?.filter(i => !i.completed).length || 0) === 0
                                        ? 'Atividades Concluídas'
                                        : isManager ? 'Delegar / Transferir' : 'Transferir / Devolver'}
                                </button>

                            )}

                            {(notes?.trim() || canEditOrAppendNotes) && (
                                <button
                                    onClick={() => setIsNoteModalOpen(true)}
                                    className={`flex items-center gap-2 px-6 py-3 font-black rounded-2xl shadow-xl dark:shadow-none transition-all active:scale-95 ${notes?.trim()
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                >
                                    {notes?.trim() ? <MessageSquare className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {notes?.trim() ? 'Notas' : 'Adicionar Nota'}
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl transition-all active:scale-95"
                            >
                                Fechar Visualização
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Transfer Demand Form Modal */}
            {
                isTransferring && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-800">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    <ArrowRightLeft className="w-8 h-8 text-amber-500" />
                                    Transferir Demanda
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Preencha o checklist de transferência para passar a responsabilidade.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nome da Demanda/Projeto</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold"
                                        value={transferData.projectName}
                                        onChange={e => setTransferData({ ...transferData, projectName: e.target.value })}
                                    />
                                </div>

                                {isTransferring && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setTransferMode('squad'); setTransferData({ ...transferData, toId: '' }); }}
                                            className={`flex-1 min-w-[120px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${transferMode === 'squad' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm border border-amber-200 dark:border-amber-900' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Squad
                                        </button>
                                        {isManager && (
                                            <button
                                                type="button"
                                                onClick={() => { setTransferMode('delegar'); setTransferData({ ...transferData, toId: '' }); }}
                                                className={`flex-1 min-w-[120px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${transferMode === 'delegar' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm border border-amber-200 dark:border-amber-900' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Delegar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setTransferMode('devolver'); setTransferData({ ...transferData, toId: '' }); }}
                                            className={`flex-1 min-w-[120px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${transferMode === 'devolver' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm border border-amber-200 dark:border-amber-900' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Devolver
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Passador (Atual)</label>
                                        <div className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold border border-transparent">
                                            {assignee?.name || 'Sistema'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            {transferMode === 'squad' ? 'Receptor (Equipe/Squad)' : transferMode === 'delegar' ? 'Receptor (Colaborador)' : 'Receptor (De Volta Para...)'}
                                        </label>
                                        <select
                                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold text-sm"
                                            value={transferData.toId}
                                            onChange={e => setTransferData({ ...transferData, toId: e.target.value })}
                                        >
                                            <option value="">Selecione quem assumirá...</option>
                                            {transferMode === 'squad' ? (
                                                teams.map(team => (
                                                    <option key={team} value={`team:${team}`}>{team}</option>
                                                ))
                                            ) : transferMode === 'delegar' ? (
                                                collaborators
                                                    .filter(c => {
                                                        const currentUserRole = collaborators.find(user => user.id === currentUserId)?.role;
                                                        return c.id !== currentUserId && c.role === currentUserRole;
                                                    })
                                                    .map(c => (
                                                        <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                                    ))
                                            ) : (
                                                /* Modo DEVOLVER: Mostra Criador + Pessoas no Histórico */
                                                collaborators
                                                    .filter(c => {
                                                        const involvedIds = [
                                                            task.creatorId,
                                                            ...(task.transferHistory?.map(h => h.fromId) || [])
                                                        ].filter(id => id && id !== currentUserId);
                                                        return involvedIds.includes(c.id);
                                                    })
                                                    .map(c => (
                                                        <option key={c.id} value={c.id}>{c.name} (Envolvido)</option>
                                                    ))
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Só mostra as próximas etapas após selecionar um Receptor */}
                                {transferData.toId && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        {/* Checklist de Seleção de Itens (Split) */}
                                        {task.checklist && task.checklist.filter(i => !i.completed).length > 0 && (
                                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                        Atividades Pendentes ({selectedItemsForTransfer.length}/{task.checklist.filter(i => !i.completed).length})
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const pendingIndices = task.checklist!.map((item, i) => ({ item, i })).filter(x => !x.item.completed).map(x => x.i);
                                                            setSelectedItemsForTransfer(selectedItemsForTransfer.length === pendingIndices.length ? [] : pendingIndices);
                                                        }}
                                                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        {selectedItemsForTransfer.length === task.checklist!.filter(i => !i.completed).length ? 'Desmarcar Todos' : 'Selecionar Tudo'}
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {task.checklist.map((item, idx) => {
                                                        if (item.completed) return null;
                                                        return (
                                                            <label
                                                                key={idx}
                                                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedItemsForTransfer.includes(idx)
                                                                    ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50'
                                                                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                                                    checked={selectedItemsForTransfer.includes(idx)}
                                                                    onChange={() => {
                                                                        setSelectedItemsForTransfer(prev =>
                                                                            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                                                        );
                                                                    }}
                                                                />
                                                                <span className={`text-xs font-bold ${selectedItemsForTransfer.includes(idx) ? 'text-amber-900 dark:text-amber-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                    {item.title}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Data Transferência (Hoje)</label>
                                                <div className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold border border-transparent">
                                                    {formatDate(transferData.transferDate)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Prazo Final (Deadline)</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        type="date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="col-span-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold text-sm"
                                                        value={transferData.deadline.split('T')[0] || ''}
                                                        onChange={e => {
                                                            const date = e.target.value;
                                                            const time = transferData.deadline.split('T')[1] || '08:00';
                                                            setTransferData({ ...transferData, deadline: `${date}T${time}` });
                                                        }}
                                                    />
                                                    <select
                                                        className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold text-sm h-full"
                                                        value={transferData.deadline.split('T')[1]?.split(':')[0] || '08'}
                                                        onChange={e => {
                                                            const hour = e.target.value;
                                                            const date = transferData.deadline.split('T')[0] || new Date().toISOString().split('T')[0];
                                                            const minutes = hour === '18' ? '00' : (transferData.deadline.split('T')[1]?.split(':')[1] || '00');
                                                            setTransferData({ ...transferData, deadline: `${date}T${hour}:${minutes}` });
                                                        }}
                                                    >
                                                        {Array.from({ length: 11 }, (_, i) => String(i + 8).padStart(2, '0')).map(h => (
                                                            <option key={h} value={h}>{h}h</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold text-sm h-full"
                                                        value={transferData.deadline.split('T')[1]?.split(':')[1] || '00'}
                                                        disabled={(transferData.deadline.split('T')[1]?.split(':')[0] || '08') === '18'}
                                                        onChange={e => {
                                                            const minutes = e.target.value;
                                                            const [date, fullTime] = transferData.deadline.split('T');
                                                            const hour = fullTime?.split(':')[0] || '08';
                                                            setTransferData({ ...transferData, deadline: `${date}T${hour}:${minutes}` });
                                                        }}
                                                    >
                                                        <option value="00">00</option>
                                                        <option value="15">15</option>
                                                        <option value="30">30</option>
                                                        <option value="45">45</option>
                                                    </select>
                                                </div>
                                                <p className="text-[9px] text-slate-400 italic mt-1 px-1">
                                                    * Horário comercial: 08:00 às 18:00.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setIsTransferring(false)}
                                        className="flex-1 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!transferData.toId || !transferData.deadline) {
                                                alert("Preencha o Receptor e o Deadline.");
                                                return;
                                            }

                                            const deadlineDate = new Date(transferData.deadline);
                                            if (deadlineDate <= new Date()) {
                                                alert("O prazo (Deadline) não pode ser igual ou menor que a hora atual.");
                                                return;
                                            }

                                            if (selectedItemsForTransfer.length === 0) {
                                                alert("Selecione pelo menos um item da checklist para transferir.");
                                                return;
                                            }

                                            if (!onTransferTask) return;

                                            await onTransferTask(
                                                task.id,
                                                transferData.toId,
                                                selectedItemsForTransfer,
                                                transferData,
                                                transferMode
                                            );

                                            setIsTransferring(false);
                                            setSelectedItemsForTransfer([]);
                                            onClose();
                                        }}
                                        className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-600 shadow-xl shadow-amber-100 dark:shadow-none transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        Confirmar Transferência
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Timeline do Histórico de Transferências */}
            {
                task.transferHistory && task.transferHistory.length > 0 && (
                    <div className="fixed inset-y-0 right-0 z-[100] w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-100 dark:border-slate-800 shadow-2xl p-8 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-500" />
                                Linha do Tempo
                            </h4>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                            {(task.transferHistory || []).map((h, i) => {
                                const isCriacao = h.type === 'criacao';
                                const isFinalizacao = h.type === 'finalizacao';
                                const isDelegacao = h.type === 'delegacao';
                                const isDevolucao = h.type === 'devolucao';

                                const colorClass = isCriacao ? 'bg-emerald-500' :
                                    isFinalizacao ? 'bg-cyan-500' :
                                        isDevolucao ? 'bg-rose-500' :
                                            isDelegacao ? 'bg-indigo-500' : 'bg-amber-500';

                                return (
                                    <div key={i} className="relative pl-10">
                                        <div className={`absolute left-1.5 top-1 w-6 h-6 rounded-full ${colorClass} border-4 border-white dark:border-slate-900 flex items-center justify-center`}>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {formatDate(h.date)} • {isCriacao ? 'Criação' : isFinalizacao ? 'Concluída' : isDelegacao ? 'Delegação' : isDevolucao ? 'Devolvida' : 'Transferência'}
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                            {isCriacao ? `Iniciada por ${h.fromName}` :
                                                isFinalizacao ? `Finalizada por ${h.fromName}` :
                                                    `${h.fromName} ➔ ${h.toName}`}
                                        </p>
                                        {h.projectName && !isFinalizacao && (
                                            <p className="text-[10px] text-slate-500 mt-1 italic">"{h.projectName}"</p>
                                        )}
                                        {h.deadline && (
                                            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">Prazo: {new Date(h.deadline).toLocaleString('pt-BR')}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }

            {/* Image Preview Modal */}
            {
                previewUrl && (
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
                )
            }

            {/* Note Modal */}
            {
                isNoteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                                    Observações / Resposta
                                </h3>
                                <button
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                                {canFullEditNotes ? (
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Adicione observações, respostas ou detalhes sobre a execução..."
                                        className="w-full h-full min-h-[300px] p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200 resize-none"
                                    />
                                ) : (
                                    <>
                                        {/* Read-only view of existing notes */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 min-h-[8rem] max-h-[40vh] overflow-y-auto custom-scrollbar">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                                {notes || 'Nenhuma observação registrada.'}
                                            </p>
                                        </div>

                                        {/* Input for new note (Append mode) */}
                                        {canAppendNotes && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Adicionar Nova Nota</label>
                                                <textarea
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Digite sua nota aqui..."
                                                    className="w-full h-32 p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200 resize-none shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end flex-shrink-0">
                                {canEditOrAppendNotes ? (
                                    <button
                                        onClick={() => {
                                            handleSaveNotes();
                                            // Only close if saving was successful or if no changes were made? 
                                            // For simplicity, handleSaveNotes manages update, we close here if valid.
                                            // Actually let's keep it simple: if saving works, we close.
                                            // Since handleSaveNotes is async, we should wait. 
                                            // But reusing the existing logic structure:
                                            if (!isSaving) setIsNoteModalOpen(false);
                                        }}
                                        disabled={isSaving || (canAppendNotes && !newNote.trim())}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {isSaving ? 'Salvando...' : 'Salvar e Fechar'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsNoteModalOpen(false)}
                                        className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Fechar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};
