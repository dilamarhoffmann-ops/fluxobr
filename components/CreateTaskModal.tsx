
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Type, Building2, CheckSquare, Link as LinkIcon, HelpCircle } from 'lucide-react';
import { Collaborator, TaskInput, TaskPriority, TaskStatus, Company, FAQItem, Task } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskInput, targetCompanyIds: string[]) => void;
  collaborators: Collaborator[];
  companies: Company[];
  faqs: FAQItem[];
  taskToEdit?: Task;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  collaborators, 
  companies, 
  faqs,
  taskToEdit 
}) => {
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assigneeId: collaborators[0]?.id || '',
    dueDate: new Date().toISOString().split('T')[0],
    faqId: '',
  });
  
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(companies.length > 0 ? [companies[0].id] : []);

  // Pre-fill form if editing
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        assigneeId: taskToEdit.assigneeId,
        dueDate: taskToEdit.dueDate,
        faqId: taskToEdit.faqId || '',
      });
      // In edit mode, we are usually working on a single task tied to one company
      setSelectedCompanyIds([taskToEdit.companyId]);
    } else {
      // Reset defaults for Create mode
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assigneeId: collaborators[0]?.id || '',
        dueDate: new Date().toISOString().split('T')[0],
        faqId: '',
      });
      setSelectedCompanyIds(companies.length > 0 ? [companies[0].id] : []);
    }
  }, [taskToEdit, isOpen, companies]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId || selectedCompanyIds.length === 0) return;
    onSave(formData, selectedCompanyIds);
    onClose();
  };

  const toggleCompany = (companyId: string) => {
    // If editing, usually prevent changing company or selecting multiple, 
    // but we can allow single select switch if desired. For now, strict on Edit.
    if (taskToEdit) return; 

    setSelectedCompanyIds(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-800">
            {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" /> Título da Tarefa
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="Ex: Implementar Login Social"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all h-24 resize-none"
              placeholder="Detalhes da atividade..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          {/* FAQ Select Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400" /> FAQ Link (Opcional)
            </label>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white text-slate-700"
                value={formData.faqId || ''}
                onChange={e => setFormData({ ...formData, faqId: e.target.value })}
              >
                <option value="">Selecione uma Pergunta Frequente...</option>
                {faqs.map(faq => (
                  <option key={faq.id} value={faq.id}>
                    {faq.question} {faq.url ? '' : '(Sem Link)'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                 <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            {faqs.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">Nenhuma FAQ cadastrada.</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">Selecione uma FAQ com link para exibir o ícone de ajuda na tarefa.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> 
              {taskToEdit ? 'Empresa' : 'Empresas (Replicar tarefa)'}
            </label>
            <div className={`grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-32 overflow-y-auto ${taskToEdit ? 'opacity-70' : ''}`}>
              {companies.map(company => (
                <label key={company.id} className={`flex items-center gap-2 ${taskToEdit ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'} p-1 rounded`}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedCompanyIds.includes(company.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                     {selectedCompanyIds.includes(company.id) && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    disabled={!!taskToEdit}
                    checked={selectedCompanyIds.includes(company.id)}
                    onChange={() => toggleCompany(company.id)}
                  />
                  <span className="text-sm text-slate-700">{company.name}</span>
                </label>
              ))}
            </div>
            {selectedCompanyIds.length === 0 && <p className="text-xs text-red-500">Selecione pelo menos uma empresa.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-400" /> Prioridade
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-900 text-white"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                {Object.values(TaskPriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-900 text-white"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                {Object.values(TaskStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Responsável
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-900 text-white"
                value={formData.assigneeId}
                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Prazo
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedCompanyIds.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {taskToEdit 
                ? 'Salvar Alterações' 
                : (selectedCompanyIds.length > 1 ? `Criar ${selectedCompanyIds.length} Tarefas` : 'Criar Tarefa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
