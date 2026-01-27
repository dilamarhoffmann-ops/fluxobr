
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Type, Building2, CheckSquare, Link as LinkIcon, HelpCircle, Users, Bell, Clock, PlusCircle, Layers, RefreshCw, Upload } from 'lucide-react';
import { Collaborator, TaskInput, TaskPriority, TaskStatus, Company, FAQItem, Task } from '../types';
import { storage } from '../lib/supabase';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskInput | TaskInput[], targetCompanyIds: string[], replicateToAllMembers: boolean) => void;
  collaborators: Collaborator[];
  companies: Company[];
  faqs: FAQItem[];
  taskTemplates?: any[];
  taskToEdit?: Task;
  preselectedDate?: string;
  initialMode?: 'nova' | 'modelo' | 'lembrete';
  isManager?: boolean;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  collaborators,
  companies,
  faqs,
  taskTemplates = [],
  taskToEdit,
  preselectedDate,
  initialMode = 'nova',
  isManager = false
}) => {
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assigneeId: '', // Força seleção manual
    dueDate: new Date().toISOString().split('T')[0],
    faqId: '',
    reminder: '',
    checklist: [],
    repeatFrequency: 'none',
  });

  const [creationMode, setCreationMode] = useState<'nova' | 'modelo' | 'lembrete'>(initialMode);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplateTaskIds, setSelectedTemplateTaskIds] = useState<string[]>([]);
  const [taskActivities, setTaskActivities] = useState<Record<string, string[]>>({});

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(companies.length > 0 ? [companies[0].id] : []);
  const [replicateToAllMembers, setReplicateToAllMembers] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (!isOpen) return;

    const formatForDateTimeLocal = (isoString?: string) => {
      if (!isoString) return '';
      try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';

        let hours = date.getHours();
        let minutes = date.getMinutes();

        // Garantir que sejam números válidos
        if (isNaN(hours)) hours = 8;
        if (isNaN(minutes)) minutes = 0;

        // Aplicar regras de negócio (08:00 - 18:00)
        if (hours < 8) {
          hours = 8;
          minutes = 0;
        } else if (hours > 18 || (hours === 18 && minutes > 0)) {
          hours = 18;
          minutes = 0;
        }

        // Intervalos de 15 minutos (00, 15, 30, 45)
        minutes = Math.round(minutes / 15) * 15;
        if (minutes === 60) {
          if (hours < 18) {
            hours += 1;
            minutes = 0;
          } else {
            minutes = 45;
          }
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        return `${year}-${month}-${day}T${hStr}:${mStr}`;
      } catch (e) {
        return '';
      }
    };

    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        assigneeId: taskToEdit.assigneeId,
        dueDate: formatForDateTimeLocal(taskToEdit.dueDate),
        faqId: taskToEdit.faqId || '',
        reminder: taskToEdit.reminder || '',
        repeatFrequency: taskToEdit.repeatFrequency || 'none',
      });
      setSelectedCompanyIds([taskToEdit.companyId]);
      setReplicateToAllMembers(false);
      setReplicateToAllMembers(false);
      setSelectedFile(null); // Reset file
      setCreationMode('nova'); // Força visualização dos inputs
    } else {
      const defaultDate = preselectedDate
        ? (preselectedDate.length === 10 ? `${preselectedDate}T12:00` : formatForDateTimeLocal(preselectedDate))
        : formatForDateTimeLocal(new Date().toISOString());

      setFormData({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assigneeId: collaborators.length > 0 ? collaborators[0].id : '',
        dueDate: defaultDate,
        faqId: '',
        reminder: '',
        checklist: [],
        repeatFrequency: 'none',
      });
      setSelectedCompanyIds(companies.length > 0 ? [companies[0].id] : []);
      setReplicateToAllMembers(false);
      setCreationMode(initialMode);
      setSelectedFile(null); // Reset file
    }
  }, [isOpen, taskToEdit, initialMode, preselectedDate, companies]); // Added companies to deps

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedFileUrl = '';

    // Upload de Arquivo
    if (selectedFile) {
      if (isUploading) return; // Evita duplo clique
      setIsUploading(true);
      try {
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${cleanName}`;

        const { error } = await storage.upload('task-attachments', fileName, selectedFile);
        if (error) throw error;

        uploadedFileUrl = storage.getPublicUrl('task-attachments', fileName);
      } catch (err) {
        console.error('Erro no upload', err);
        alert('Falha ao enviar o arquivo anexo. Tente novamente.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Validação de Prazo Retroativo (Geral para todos os modos)
    if (formData.dueDate) {
      const selectedDeadline = new Date(formData.dueDate);
      if (selectedDeadline <= new Date()) {
        alert('O prazo (Deadline) não pode ser igual ou menor que a hora atual.');
        return;
      }
    }

    if (creationMode === 'modelo') {
      if (selectedTemplateTaskIds.length === 0) {
        alert('Por favor, selecione pelo menos uma tarefa do modelo para agregar.');
        return;
      }

      const template = taskTemplates.find(t => t.id === selectedTemplateId);
      if (!template) return;

      // Validação: precisa ter responsável ou replicação ativa
      if (!formData.assigneeId && !replicateToAllMembers) {
        alert('Selecione um responsável ou ative a replicação para todos os membros.');
        return;
      }



      // Agrega as tarefas e suas atividades
      const allActivities: { title: string; completed: boolean }[] = [];
      const taskTitles: string[] = [];

      selectedTemplateTaskIds.forEach(taskId => {
        const templateTask = template.tasks.find((tk: any) => tk.id === taskId);
        if (templateTask) {
          taskTitles.push(templateTask.title);

          // Adiciona o título da tarefa do modelo como um item do checklist
          allActivities.push({ title: templateTask.title, completed: false });

          // Adiciona também as atividades específicas daquela tarefa, se houver
          const activities = (taskActivities[taskId] || []).map(title => ({ title, completed: false }));
          allActivities.push(...activities);
        }
      });

      // Cria uma única tarefa com o nome do template e todas as atividades
      const singleTask: TaskInput = {
        title: template.name, // Nome do template como título da tarefa
        description: `Tarefas:\n- ${taskTitles.join('\n- ')}`, // Lista as tarefas incluídas verticalmente
        status: TaskStatus.PENDING,
        priority: formData.priority,
        assigneeId: formData.assigneeId,
        dueDate: formData.dueDate,
        faqId: formData.faqId,
        reminder: formData.reminder,
        checklist: allActivities,
        attachmentUrl: uploadedFileUrl || undefined,
      };

      console.log('Criando tarefa única do template:', singleTask);
      onSave(singleTask, selectedCompanyIds, replicateToAllMembers);
    } else {
      // Modo normal ou lembrete: criar tarefa única
      const isReminder = creationMode === 'lembrete';

      if (!formData.title) {
        alert('Por favor, informe o título.');
        return;
      }

      if (!formData.assigneeId && !replicateToAllMembers) {
        alert('Por favor, selecione um responsável ou ative a replicação.');
        return;
      }

      if (isReminder && !formData.dueDate) {
        alert('Por favor, defina o Prazo (Data e Hora) para o lembrete.');
        return;
      }

      // Normalização de Datas para ISO UTC
      let finalDueDate = formData.dueDate;
      // Se for apenas data (YYYY-MM-DD), adiciona T12:00:00 para evitar shift de timezone
      if (finalDueDate.length === 10) {
        finalDueDate += 'T12:00:00.000Z';
      } else {
        // Se for datetime-local (YYYY-MM-DDTHH:mm), converte para ISO UTC real
        try {
          finalDueDate = new Date(finalDueDate).toISOString();
        } catch (e) {
          console.error("Erro ao converter data", e);
          finalDueDate = new Date().toISOString();
        }
      }

      // Lógica Unificada: O Lembrete SEMPRE segue o Prazo (dueDate), se estivermos no modo Lembrete
      const taskData = isReminder
        ? {
          ...formData,
          dueDate: finalDueDate,
          reminder: finalDueDate || null, // Lembrete = Prazo
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          checklist: [],
          attachmentUrl: uploadedFileUrl || undefined
        }
        : {
          ...formData,
          dueDate: finalDueDate,
          reminder: null,
          checklist: formData.checklist || [],
          attachmentUrl: uploadedFileUrl || undefined
        };

      onSave(taskData, selectedCompanyIds, replicateToAllMembers);
    }
  };

  const toggleCompany = (companyId: string) => {
    if (taskToEdit) return;

    setSelectedCompanyIds(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

          {!taskToEdit && (
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setCreationMode('nova')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${creationMode === 'nova' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Tarefa Avulsa
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('modelo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${creationMode === 'modelo' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Layers className="w-3.5 h-3.5" /> Usar Modelo
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('lembrete')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${creationMode === 'lembrete' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Bell className="w-3.5 h-3.5" /> Lembrete
              </button>
            </div>
          )}

          {creationMode === 'modelo' && !taskToEdit && (
            <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">1. Selecione o Modelo</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const templateId = e.target.value;
                    setSelectedTemplateId(templateId);
                    const template = taskTemplates.find(t => t.id === templateId);
                    if (template) {
                      // Auto-select all tasks from the template
                      setSelectedTemplateTaskIds(template.tasks.map((tk: any) => tk.id));

                      // Auto-select all activities for those tasks
                      const initialActivities: Record<string, string[]> = {};
                      template.tasks.forEach((tk: any) => {
                        initialActivities[tk.id] = tk.activities.map((a: any) => a.title);
                      });
                      setTaskActivities(initialActivities);
                    } else {
                      setSelectedTemplateTaskIds([]);
                      setTaskActivities({});
                    }
                  }}
                >
                  <option value="">Escolha um modelo...</option>
                  {taskTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {selectedTemplateId && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">2. Selecione Tarefas para Agregar Atividades</label>
                    <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {selectedTemplateTaskIds.length} selecionada{selectedTemplateTaskIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {taskTemplates.find(t => t.id === selectedTemplateId)?.tasks?.length > 0 ? (
                      taskTemplates.find(t => t.id === selectedTemplateId)?.tasks.map((tk: any) => {
                        const isSelected = selectedTemplateTaskIds.includes(tk.id);
                        const selectedActivitiesForTask = taskActivities[tk.id] || [];

                        return (
                          <div
                            key={tk.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}
                            onClick={() => {
                              setSelectedTemplateTaskIds(prev => {
                                if (prev.includes(tk.id)) {
                                  // Remove task and its activities
                                  const newActivities = { ...taskActivities };
                                  delete newActivities[tk.id];
                                  setTaskActivities(newActivities);
                                  return prev.filter(id => id !== tk.id);
                                } else {
                                  // Add task and initialize with all activities selected
                                  setTaskActivities(prev => ({
                                    ...prev,
                                    [tk.id]: tk.activities?.map((a: any) => a.title) || []
                                  }));
                                  return [...prev, tk.id];
                                }
                              });
                            }}
                          >
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}
                              >
                                {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{tk.title}</p>
                                {tk.description && (
                                  <p className="text-xs text-slate-500 mt-0.5">{tk.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{tk.priority || 'Média'}</span>
                                  <span className="text-[9px] text-slate-400">•</span>
                                  <span className="text-[9px] text-slate-500">{tk.activities?.length || 0} atividade{tk.activities?.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </label>

                            {isSelected && tk.activities?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in" onClick={e => e.stopPropagation()}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Atividades do Checklist:</p>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                  {tk.activities.map((act: any) => (
                                    <label key={act.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-indigo-50 transition-colors cursor-pointer group/activity">
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTaskActivities(prev => {
                                            const currentActivities = prev[tk.id] || [];
                                            return {
                                              ...prev,
                                              [tk.id]: currentActivities.includes(act.title)
                                                ? currentActivities.filter(a => a !== act.title)
                                                : [...currentActivities, act.title]
                                            };
                                          });
                                        }}
                                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedActivitiesForTask.includes(act.title) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}
                                      >
                                        {selectedActivitiesForTask.includes(act.title) && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                                      </div>
                                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{act.title}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Este modelo não possui tarefas cadastradas.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {(creationMode !== 'modelo' || !!taskToEdit) && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-slate-400" /> {creationMode === 'lembrete' ? 'Título do Lembrete' : 'Título da Tarefa'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder={creationMode === 'lembrete' ? "Ex: Ligar para cliente" : "Ex: Implementar Login Social"}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          )}

          {(creationMode !== 'modelo' || !!taskToEdit) && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all h-24 resize-none"
                placeholder={creationMode === 'lembrete' ? "O que você precisa lembrar?" : "Detalhes da atividade..."}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          )}



          {creationMode !== 'lembrete' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-400" /> Repetir Tarefa
              </label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
                  value={formData.repeatFrequency || 'none'}
                  onChange={e => setFormData({ ...formData, repeatFrequency: e.target.value as any })}
                >
                  <option value="none">Não se repete</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {creationMode !== 'lembrete' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" /> FAQ Link (Opcional)
              </label>
              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
                  value={formData.faqId || ''}
                  onChange={e => setFormData({ ...formData, faqId: e.target.value })}
                >
                  <option value="">Selecione uma Pergunta Frequente...</option>
                  {faqs.map(faq => (
                    <option key={faq.id} value={faq.id}>{faq.question}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              {taskToEdit ? 'Empresa' : creationMode === 'lembrete' ? 'Empresas (Opcional para Lembretes)' : 'Empresas (Replicar tarefa)'}
            </label>
            <div className={`grid grid-cols-1 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[60px] max-h-32 overflow-y-auto`}>
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <span className="text-xs text-amber-600 font-semibold">Nenhuma empresa disponível para sua equipe.</span>
                  <span className="text-[10px] text-slate-400">Contate um administrador para vincular você a uma empresa.</span>
                </div>
              ) : (
                companies.map(company => (
                  <label key={company.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedCompanyIds.includes(company.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white dark:bg-slate-900'}`}>
                      {selectedCompanyIds.includes(company.id) && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      disabled={!!taskToEdit}
                      checked={selectedCompanyIds.includes(company.id)}
                      onChange={() => toggleCompany(company.id)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{company.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {creationMode !== 'lembrete' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-slate-400" /> Prioridade
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                >
                  {Object.values(TaskPriority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                >
                  {Object.values(TaskStatus).map(s => {
                    const isDisabled = !isManager && (s === TaskStatus.DONE || s === TaskStatus.ARCHIVED);
                    return (
                      <option key={s} value={s} disabled={isDisabled}>
                        {s} {isDisabled ? '(Apenas Gestores)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Responsável
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
              value={formData.assigneeId}
              onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
              disabled={replicateToAllMembers}
            >
              <option value="">Selecione um responsável...</option>
              {collaborators.length === 0 && <option value="" disabled>Nenhum colaborador disponível</option>}
              {collaborators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Definir Prazo</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.dueDate.split('T')[0]}
                  onChange={e => {
                    const date = e.target.value;
                    const time = formData.dueDate.split('T')[1] || '08:00';
                    setFormData({ ...formData, dueDate: `${date}T${time}` });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário Agendado</label>
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-2 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
                    value={formData.dueDate.split('T')[1]?.split(':')[0] || '08'}
                    onChange={e => {
                      const hour = e.target.value;
                      const date = formData.dueDate.split('T')[0];
                      const minutes = hour === '18' ? '00' : (formData.dueDate.split('T')[1]?.split(':')[1] || '00');
                      setFormData({ ...formData, dueDate: `${date}T${hour}:${minutes}` });
                    }}
                  >
                    {Array.from({ length: 11 }, (_, i) => String(i + 8).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>

                  <select
                    className="flex-1 px-2 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium disabled:opacity-50"
                    value={formData.dueDate.split('T')[1]?.split(':')[1] || '00'}
                    disabled={(formData.dueDate.split('T')[1]?.split(':')[0] || '08') === '18'}
                    onChange={e => {
                      const minutes = e.target.value;
                      const [date, fullTime] = formData.dueDate.split('T');
                      const hour = fullTime?.split(':')[0] || '08';
                      setFormData({ ...formData, dueDate: `${date}T${hour}:${minutes}` });
                    }}
                  >
                    <option value="00">00 min</option>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic mt-1">
              * Apenas horários comerciais (08:00 - 18:00) em intervalos de 15 minutos.
            </p>
          </div>

          {!taskToEdit && (
            <div className="flex items-center gap-2 pt-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <input
                type="checkbox"
                id="replicateToAll"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={replicateToAllMembers}
                onChange={e => setReplicateToAllMembers(e.target.checked)}
              />
              <label htmlFor="replicateToAll" className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 cursor-pointer select-none flex items-center gap-2">
                <Users className="w-4 h-4" /> Replicar para todos os membros da equipe
              </label>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                (creationMode === 'modelo' && !selectedTemplateId) ||
                (creationMode !== 'modelo' && !formData.title)
              }
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {taskToEdit ? 'Salvar Alterações' : creationMode === 'modelo' && selectedTemplateTaskIds.length > 0 ? 'Criar Tarefa com Atividades' : creationMode === 'lembrete' ? 'Salvar Lembrete' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};
