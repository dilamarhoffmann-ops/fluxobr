
import React, { useState } from 'react';
import { HelpCircle, ChevronRight, BookOpen, Plus, Trash2, Edit2, Save, X, ExternalLink, FileText, FileUp, Paperclip } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQManagerProps {
  faqs: FAQItem[];
  onAdd: (faq: Omit<FAQItem, 'id'>) => void;
  onUpdate: (id: string, faq: Omit<FAQItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const FAQManager: React.FC<FAQManagerProps> = ({ faqs, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ question: '', answer: '', url: '', pdfUrl: '' });

  const resetForm = () => {
    setFormData({ question: '', answer: '', url: '', pdfUrl: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (faq: FAQItem) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      url: faq.url || '',
      pdfUrl: faq.pdfUrl || ''
    });
    setEditingId(faq.id);
    setIsAdding(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo é muito grande. O limite é 2MB para armazenamento local.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, pdfUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Por favor, selecione apenas arquivos PDF.");
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, pdfUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    if (editingId) {
      onUpdate(editingId, formData);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">FAQ do Gestor</h2>
          <p className="text-slate-500">Gerencie a base de conhecimento e links úteis para as tarefas.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nova Pergunta
          </button>
        )}
      </div>

      {/* Form Area (Add or Edit) */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 ring-4 ring-indigo-50/50">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Pergunta' : 'Nova Pergunta Frequente'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pergunta / Título</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: Como solicitar acesso à VPN?"
                value={formData.question}
                onChange={e => setFormData({ ...formData, question: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resposta / Descrição</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none"
                placeholder="Descreva o procedimento ou resposta..."
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-slate-400" /> Link Externo (Opcional)
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="https://wiki.empresa.com/doc..."
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
              />
              <p className="text-xs text-slate-400 mt-1">Este link será usado quando esta FAQ for selecionada em uma tarefa.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" /> Anexar Documento PDF
              </label>

              {formData.pdfUrl ? (
                <div className="flex items-center justify-between bg-white p-2 rounded border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium">Documento anexado</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 py-4 border border-dashed border-slate-300 rounded-lg bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                    <FileUp className="w-5 h-5" />
                    <span className="text-sm">Clique para subir PDF (Máx 2MB)</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                <Save className="w-4 h-4 inline mr-2" /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ List */}
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative">

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditClick(faq)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(faq.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-4 pr-16">
              <div className="bg-indigo-100 p-2 rounded-lg mt-1 shrink-0">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate pr-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-2">{faq.answer}</p>
                {faq.url && (
                  <a href={faq.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Acessar Link Relacionado
                  </a>
                )}
                {faq.pdfUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">
                      <FileText className="w-3 h-3" /> Possui PDF anexado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma pergunta cadastrada.</p>
            <p className="text-sm text-slate-400">Adicione perguntas frequentes para ajudar sua equipe.</p>
          </div>
        )}
      </div>
    </div>
  );
};
