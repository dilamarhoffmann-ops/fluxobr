
import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, BookOpen, Plus, Trash2, Edit2, Save, X, ExternalLink, FileText, FileUp, Paperclip, Link, Copy, Check, Loader2 } from 'lucide-react';
import { FAQItem } from '../types';
import { storage } from '../lib/supabase';

interface FAQManagerProps {
  faqs: FAQItem[];
  onAdd: (faq: Omit<FAQItem, 'id'>) => void;
  onUpdate: (id: string, faq: Omit<FAQItem, 'id'>) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  userAccessLevel: string;
  currentUserId: string;
}

export const FAQManager: React.FC<FAQManagerProps> = ({ faqs, onAdd, onUpdate, onDelete, isAdmin, userAccessLevel, currentUserId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isExpandingAnswer, setIsExpandingAnswer] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => prev === id ? null : id);
  };

  const loadAttachments = async () => {
    setIsLoadingAttachments(true);
    try {
      const { data, error } = await storage.list('task-attachments');
      if (error) throw error;
      if (data) {
        setAttachments(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err) {
      console.error("Erro ao carregar anexos:", err);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, []);

  const handleDeleteAttachment = async (fileName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) return;

    try {
      const { error } = await storage.remove('task-attachments', [fileName]);
      if (error) throw error;
      setAttachments(prev => prev.filter(a => a.name !== fileName));
    } catch (err) {
      console.error("Erro ao excluir anexo:", err);
      alert("Erro ao excluir documento.");
    }
  };

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


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("O arquivo é muito grande. O limite é 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `faq-${Date.now()}-${cleanName}`;

      const { error } = await storage.upload('task-attachments', fileName, file);
      if (error) throw error;

      const publicUrl = storage.getPublicUrl('task-attachments', fileName);
      setFormData({ ...formData, pdfUrl: publicUrl });
      loadAttachments(); // Refresh list after upload
    } catch (err) {
      console.error("Erro no upload", err);
      alert("Falha ao enviar o arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const removeFile = () => {
    setFormData({ ...formData, pdfUrl: '' });
  };

  const sortedFaqs = React.useMemo(() => {
    let filtered = [...faqs];

    if (searchTerm.trim()) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.question.toLowerCase().includes(lowSearch) ||
        f.answer.toLowerCase().includes(lowSearch)
      );
    }

    return filtered.sort((a, b) => a.question.localeCompare(b.question));
  }, [faqs, searchTerm]);

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
          <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
          <p className="text-slate-500">Principais perguntas.</p>
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

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <HelpCircle className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Busque por assuntos, palavras-chave ou procedimentos..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
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
            <div className="relative group/field">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Resposta / Descrição</label>
                <button
                  type="button"
                  onClick={() => setIsExpandingAnswer(true)}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Expandir Tela
                </button>
              </div>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[150px] resize-y custom-scrollbar leading-relaxed"
                placeholder="Descreva o procedimento ou resposta..."
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                required
              />
            </div>

            {/* Modal de Resposta Expandida */}
            {isExpandingAnswer && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-slate-100 dark:border-slate-800">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-indigo-600" />
                      Editor de Resposta
                    </h3>
                    <button
                      onClick={() => setIsExpandingAnswer(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pergunta: {formData.question || '...'}</p>
                    <textarea
                      autoFocus
                      className="flex-1 w-full p-6 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-0 focus:outline-none resize-none text-lg leading-relaxed custom-scrollbar shadow-inner"
                      placeholder="Escreva aqui a resposta detalhada..."
                      value={formData.answer}
                      onChange={e => setFormData({ ...formData, answer: e.target.value })}
                    />
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setIsExpandingAnswer(false)}
                      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                      Concluir Edição
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                <div className="flex flex-col gap-2 bg-indigo-50/50 p-3 rounded border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 truncate">
                      <FileText className="w-4 h-4 shrink-0" />
                      <a href={formData.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline truncate max-w-[200px]">
                        Visualizar PDF
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover anexo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={formData.pdfUrl}
                      className="flex-1 text-[10px] text-slate-500 bg-white border border-slate-200 rounded px-2 py-1 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.pdfUrl)}
                      className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
                      title="Copiar Link"
                    >
                      {copiedLink === formData.pdfUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-center gap-2 py-4 border border-dashed border-slate-300 rounded-lg bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        <span className="text-sm text-indigo-500">Enviando PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-5 h-5" />
                        <span className="text-sm">Clique para subir PDF (Máx 5MB)</span>
                      </>
                    )}
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
      <div className="space-y-3">
        {sortedFaqs.map((faq) => {
          const isExpanded = expandedFaqs[faq.id];
          const isOwner = faq.creatorId === currentUserId;
          const canManage = isAdmin || isOwner;

          return (
            <div key={faq.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${isExpanded ? 'border-indigo-200 ring-2 ring-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
              {/* Accordion Header */}
              <div
                onClick={() => toggleFaq(faq.id)}
                className={`flex items-center justify-between p-5 cursor-pointer select-none group ${isExpanded ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className={`w-5 h-5 ${isExpanded ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className={`text-base font-bold truncate transition-colors ${isExpanded ? 'text-indigo-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {faq.question}
                    </h3>
                    {isOwner && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mt-0.5">Criado por você</span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditClick(faq)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(faq.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion Content */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-14 pb-6 space-y-4">
                  <div className="h-px bg-slate-100 w-full mb-4"></div>
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {faq.answer}
                  </p>

                  {(faq.url || faq.pdfUrl) && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {faq.url && (
                        <a
                          href={faq.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Acessar Link Externo
                        </a>
                      )}
                      {faq.pdfUrl && (
                        <div className="flex items-center gap-2">
                          <a
                            href={faq.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Visualizar PDF
                          </a>
                          <button
                            onClick={() => copyToClipboard(faq.pdfUrl!)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Copiar Link do PDF"
                          >
                            {copiedLink === faq.pdfUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedFaqs.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
              <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-600 font-bold text-lg">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma pergunta cadastrada'}
            </p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
              {searchTerm
                ? `Não encontramos nada para "${searchTerm}". Tente outros termos.`
                : 'Adicione perguntas frequentes para ajudar sua equipe.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-indigo-600 font-bold uppercase tracking-widest text-xs hover:text-indigo-700 transition-colors"
              >
                Limpar Busca
              </button>
            )}
          </div>
        )}
      </div>

      {/* Attached Documents Section - Only for Admins */}
      {isAdmin && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-indigo-600" />
            Documentos Anexados
          </h3>

          {isLoadingAttachments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Nenhum documento anexado encontrado.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-700">Nome do Arquivo</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Data de Envio</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Tamanho</th>
                      <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attachments.map((file) => {
                      const publicUrl = storage.getPublicUrl('task-attachments', file.name);
                      return (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-50 p-2 rounded text-red-600">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="font-medium text-slate-700 truncate max-w-[300px]" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(file.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Visualizar"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => copyToClipboard(publicUrl)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                title="Copiar Link"
                              >
                                {copiedLink === publicUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Link className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteAttachment(file.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div >
  );
};
