
import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ChevronRight, BookOpen, Plus, Trash2, Edit2, Save, X, ExternalLink, FileText, FileUp, Paperclip, Link, Copy, Check, Loader2, Image as ImageIcon, Download, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQItem } from '../types';
import { storage } from '../lib/supabase';
import { isImageFile, copyToClipboard, getCleanFileName } from '../lib/faqUtils';

// Subcomponents
import { FAQMarkdown } from './faq/FAQMarkdown';
import { FAQListItem } from './faq/FAQListItem';
import { FAQEditor } from './faq/FAQEditor';
import { FAQAttachments } from './faq/FAQAttachments';

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
  // --- UI State ---
  const [isAdding, setIsAdding] = useState(() => localStorage.getItem('faq_is_adding') === 'true');
  const [editingId, setEditingId] = useState<string | null>(() => {
    const saved = localStorage.getItem('faq_editing_id');
    return (saved && saved !== 'null') ? saved : null;
  });
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorTab, setEditorTab] = useState<'write' | 'preview' | 'split'>('write');
  const [isExpandingAnswer, setIsExpandingAnswer] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- Data State ---
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // --- Form Persistence ---
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('faq_form_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return { question: '', answer: '', url: '', pdfUrl: '', imageUrl: '' }; }
    }
    return { question: '', answer: '', url: '', pdfUrl: '', imageUrl: '' };
  });

  useEffect(() => {
    if (editingId) localStorage.setItem('faq_editing_id', editingId);
    else localStorage.removeItem('faq_editing_id');
  }, [editingId]);

  useEffect(() => {
    localStorage.setItem('faq_is_adding', isAdding ? 'true' : 'false');
  }, [isAdding]);

  useEffect(() => {
    localStorage.setItem('faq_form_data', JSON.stringify(formData));
  }, [formData]);

  // --- Logic Helpers ---
  const loadAttachments = async () => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  const handleDeleteAttachment = async (fileName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o arquivo "${fileName}"?`)) return;
    try {
      const { error } = await storage.remove('task-attachments', [fileName]);
      if (error) throw error;
      setAttachments(prev => prev.filter(a => a.name !== fileName));
    } catch (err) {
      console.error("Erro ao excluir anexo:", err);
      alert("Erro ao excluir documento.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'pdfUrl' | 'imageUrl' | 'inline') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'pdfUrl' && file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("O arquivo é muito grande. O limite é 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const cleanName = getCleanFileName(file);
      const fileName = `faq-${field}-${Date.now()}-${cleanName}`;

      const { error } = await storage.upload('task-attachments', fileName, file);
      if (error) throw error;

      const publicUrl = storage.getPublicUrl('task-attachments', fileName);

      if (field === 'inline') {
        const textToInsert = `\n![imagem](${publicUrl})\n`;
        setFormData((prev: any) => ({ ...prev, answer: prev.answer + textToInsert }));
      } else {
        setFormData((prev: any) => ({ ...prev, [field]: publicUrl }));
      }

      if (isAdmin) loadAttachments();
    } catch (err) {
      console.error("Erro no upload", err);
      alert("Falha ao enviar o arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (faq: FAQItem) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      url: faq.url || '',
      pdfUrl: faq.pdfUrl || '',
      imageUrl: faq.imageUrl || ''
    });
    setEditingId(faq.id);
    setIsAdding(false);
    setEditorTab('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', url: '', pdfUrl: '', imageUrl: '' });
    setIsAdding(false);
    setEditingId(null);
    setLastSavedTime(null);
    setEditorTab('write');
    localStorage.removeItem('faq_editing_id');
    localStorage.removeItem('faq_is_adding');
    localStorage.removeItem('faq_form_data');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    if (editingId) {
      await onUpdate(editingId, formData);
      setLastSavedTime(new Date());
    } else {
      await onAdd(formData);
      resetForm();
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!editingId) return;

    const timeoutId = setTimeout(async () => {
      const currentFaq = faqs.find(f => f.id === editingId);
      if (!currentFaq) return;

      const hasChanged =
        currentFaq.question !== formData.question ||
        currentFaq.answer !== formData.answer ||
        (currentFaq.url || '') !== formData.url ||
        (currentFaq.pdfUrl || '') !== formData.pdfUrl ||
        (currentFaq.imageUrl || '') !== formData.imageUrl;

      if (!hasChanged) return;

      setIsAutoSaving(true);
      try {
        await onUpdate(editingId, formData);
        setLastSavedTime(new Date());
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, editingId, faqs]);

  // Search & Filter
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

  const handleExportPDF = async () => {
    if (faqs.length === 0) return;
    setIsExporting(true);

    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '800px';
    exportContainer.style.backgroundColor = 'white';
    exportContainer.style.padding = '50px';
    exportContainer.className = 'faq-export-container';

    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="color: #1e1b4b; font-size: 32px; font-weight: 800; margin-bottom: 8px; font-family: sans-serif;">Base de Conhecimento</h1>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; font-family: sans-serif;">FluxoBR - Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    `;
    exportContainer.appendChild(header);

    faqs.forEach((faq, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.style.marginBottom = '40px';
      itemDiv.style.pageBreakInside = 'avoid';
      itemDiv.style.fontFamily = 'sans-serif';

      itemDiv.innerHTML = `
        <h3 style="color: #4338ca; font-size: 18px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #eef2ff; color: #4338ca; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">${index + 1}</span>
          ${faq.question}
        </h3>
        <div style="color: #334155; font-size: 14px; line-height: 1.7; padding-left: 34px; white-space: pre-wrap;">
          ${faq.answer.replace(/!\[.*?\]\(.*?\)/g, '[Imagem Anexada]').replace(/#+\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1')}
        </div>
      `;
      exportContainer.appendChild(itemDiv);
    });

    document.body.appendChild(exportContainer);

    try {
      const canvas = await html2canvas(exportContainer, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`FAQ_AgilePulse_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    } finally {
      document.body.removeChild(exportContainer);
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">FAQ</h2>
          <p className="text-slate-500 mt-2 font-medium">Sua central orgânica de conhecimento e procedimentos.</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting || faqs.length === 0}
              className="group flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 active:scale-95"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
              Gerar Relatório PDF
            </button>
          )}
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Adicionar Pergunta
            </button>
          )}
        </div>
      </div>

      {/* --- Search --- */}
      <div className="relative group max-w-3xl">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Busque por termos, comandos ou soluções..."
          className="w-full pl-14 pr-12 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-bold text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* --- Editor Area --- */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <FAQEditor
            formData={formData}
            editingId={editingId}
            isAutoSaving={isAutoSaving}
            lastSavedTime={lastSavedTime}
            isUploading={isUploading}
            editorTab={editorTab}
            setEditorTab={setEditorTab}
            isExpandingAnswer={isExpandingAnswer}
            setIsExpandingAnswer={setIsExpandingAnswer}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onFileUpload={handleFileUpload}
            onPreviewImage={setPreviewUrl}
          />
        )}
      </AnimatePresence>

      {/* --- FAQ List --- */}
      <div className="space-y-4">
        {sortedFaqs.length > 0 ? (
          sortedFaqs.map((faq) => (
            <FAQListItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedFaqId === faq.id}
              onToggle={() => setExpandedFaqId(prev => prev === faq.id ? null : faq.id)}
              onEdit={() => handleEditClick(faq)}
              onDelete={() => onDelete(faq.id)}
              onPreviewImage={setPreviewUrl}
              canManage={isAdmin || faq.creatorId === currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <HelpCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-400">Nenhuma pergunta encontrada para sua busca</h4>
            <p className="text-slate-400 mt-2">Tente termos mais genéricos ou adicione uma nova entrada.</p>
          </div>
        )}
      </div>

      {/* --- Admin Attachments --- */}
      {isAdmin && (
        <FAQAttachments
          attachments={attachments}
          isLoading={isLoadingAttachments}
          onDelete={handleDeleteAttachment}
          onPreviewImage={setPreviewUrl}
        />
      )}

      {/* --- Global Image Preview Modal --- */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-7xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> Pré-visualização do Anexo
                </h4>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-xl"
                />
              </div>
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => copyToClipboard(previewUrl!, () => alert('URL da imagem copiada!'))}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <Copy className="w-4 h-4" /> Copiar Link
                </button>
                <a
                  href={previewUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <ExternalLink className="w-4 h-4" /> Ver Original
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
