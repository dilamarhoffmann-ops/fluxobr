
import React, { useRef } from 'react';
import { Save, X, Loader2, Image as ImageIcon, ExternalLink, Check, Edit2, FileText, FileUp, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQMarkdown } from './FAQMarkdown';
import { isImageFile } from '../../lib/faqUtils';

interface FAQEditorProps {
    formData: {
        question: string;
        answer: string;
        url?: string;
        pdfUrl?: string;
        imageUrl?: string;
    };
    editingId: string | null;
    isAutoSaving: boolean;
    lastSavedTime: Date | null;
    isUploading: boolean;
    editorTab: 'write' | 'preview' | 'split';
    setEditorTab: (tab: 'write' | 'preview' | 'split') => void;
    isExpandingAnswer: boolean;
    setIsExpandingAnswer: (expanding: boolean) => void;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onReset: () => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'pdfUrl' | 'imageUrl' | 'inline') => void;
    onPreviewImage: (url: string) => void;
}

export const FAQEditor: React.FC<FAQEditorProps> = ({
    formData,
    editingId,
    isAutoSaving,
    lastSavedTime,
    isUploading,
    editorTab,
    setEditorTab,
    isExpandingAnswer,
    setIsExpandingAnswer,
    setFormData,
    onSubmit,
    onReset,
    onFileUpload,
    onPreviewImage
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = (text: string, ref: React.RefObject<HTMLTextAreaElement>) => {
        if (!ref.current) return;
        const textarea = ref.current;
        const scrollPos = textarea.scrollTop;
        const strPos = textarea.selectionStart || 0;
        const front = (textarea.value).substring(0, strPos);
        const back = (textarea.value).substring(textarea.selectionEnd || 0);
        const newValue = front + text + back;
        setFormData({ ...formData, answer: newValue });
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = strPos + text.length;
            textarea.focus();
            textarea.scrollTop = scrollPos;
        }, 10);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-xl shadow-2xl border border-indigo-100 ring-4 ring-indigo-50/30 mb-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {editingId ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
                    {editingId ? 'Editar Pergunta' : 'Nova Pergunta Frequente'}
                </h3>
                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {isAutoSaving ? (
                            <motion.span
                                key="saving"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                            </motion.span>
                        ) : lastSavedTime ? (
                            <motion.span
                                key="saved"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Salvo {lastSavedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Pergunta / Título</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-medium"
                        placeholder="Ex: Como solicitar acesso à VPN?"
                        value={formData.question}
                        onChange={e => setFormData({ ...formData, question: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Resposta / Descrição (Markdown)</label>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setEditorTab('write')}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${editorTab === 'write' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Escrever
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditorTab('preview')}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${editorTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditorTab('split')}
                                className={`hidden md:block px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${editorTab === 'split' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Split
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onFileUpload(e, 'inline')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button
                                type="button"
                                className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50 transition-colors"
                            >
                                <ImageIcon className="w-3 h-3" /> Inserir Imagem
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsExpandingAnswer(true)}
                            className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" /> Modo Zen (Foco)
                        </button>
                    </div>

                    <div className={`grid gap-4 ${editorTab === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                        {(editorTab === 'write' || editorTab === 'split') && (
                            <textarea
                                ref={textareaRef}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none min-h-[300px] resize-y custom-scrollbar leading-relaxed font-mono text-sm"
                                placeholder="Utilize Markdown para formatar sua resposta..."
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        )}

                        {(editorTab === 'preview' || editorTab === 'split') && (
                            <div className="p-6 bg-white rounded-xl border border-slate-200 text-slate-800 min-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                                {formData.answer ? (
                                    <FAQMarkdown content={formData.answer} onPreviewImage={onPreviewImage} />
                                ) : (
                                    <p className="text-slate-400 italic text-sm">A pré-visualização aparecerá aqui...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <ExternalLink className="w-3 h-3 text-slate-400" /> Link Wiki/Externo
                        </label>
                        <input
                            type="url"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                            placeholder="https://..."
                            value={formData.url || ''}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Paperclip className="w-3 h-3 text-slate-400" /> Anexo PDF
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => onFileUpload(e, 'pdfUrl')}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl transition-all text-sm font-bold ${formData.pdfUrl ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.pdfUrl ? <Check className="w-4 h-4" /> : <FileUp className="w-4 h-4" />}
                                <span>{formData.pdfUrl ? 'PDF Anexado' : isUploading ? 'Subindo...' : 'Subir PDF'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 text-slate-400" /> Imagem Capa
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onFileUpload(e, 'imageUrl')}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl transition-all text-sm font-bold ${formData.imageUrl ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.imageUrl ? <Check className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                <span>{formData.imageUrl ? 'Imagem Definida' : isUploading ? 'Subindo...' : 'Subir Capa'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setFormData({ question: '', answer: '', url: '', pdfUrl: '', imageUrl: '' })}
                        className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Limpar Formulário
                    </button>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {editingId ? 'Salvar Alterações' : 'Publicar Pergunta'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Zen Mode Modal */}
            <AnimatePresence>
                {isExpandingAnswer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/20"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800">Modo Zen: {formData.question || 'Sem título'}</h3>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Edição em Tela Cheia</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => onFileUpload(e, 'inline')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-100 transition-all border border-amber-100"
                                        >
                                            <ImageIcon className="w-4 h-4" /> Inserir Imagem
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsExpandingAnswer(false)}
                                        className="p-2.5 text-slate-400 hover:text-slate-600 bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:scale-110"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 min-h-0 bg-white">
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Markdown Editor</span>
                                        <span className="text-[10px] text-slate-300 font-mono">{formData.answer.length} caracteres</span>
                                    </div>
                                    <textarea
                                        ref={expandedTextareaRef}
                                        autoFocus
                                        className="flex-1 w-full p-8 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:outline-none resize-none text-lg leading-relaxed custom-scrollbar font-mono text-slate-700 shadow-inner"
                                        placeholder="Escreva sua documentação aqui..."
                                        value={formData.answer}
                                        onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visualização Real</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Live</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full p-8 bg-white border border-slate-100 rounded-2xl overflow-y-auto custom-scrollbar shadow-sm">
                                        <FAQMarkdown content={formData.answer} onPreviewImage={onPreviewImage} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <p className="text-xs text-slate-400">Pressione <kbd className="bg-white px-2 py-1 rounded border shadow-sm font-mono text-[10px]">ESC</kbd> para sair</p>
                                <button
                                    type="button"
                                    onClick={() => setIsExpandingAnswer(false)}
                                    className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 transition-all active:scale-95"
                                >
                                    Concluir e Voltar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
