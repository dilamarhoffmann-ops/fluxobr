import React, { useState, useEffect, useRef } from 'react';
import { X, HelpCircle, Save, Edit3, Eye, FileText, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isAdmin }) => {
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editorTab, setEditorTab] = useState<'write' | 'preview' | 'split'>('write');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchHelpContent();
        }
    }, [isOpen]);

    const fetchHelpContent = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'help_text')
                .single();

            if (data) {
                setContent(data.value);
            }
        } catch (err) {
            console.error('Error fetching help content:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n');

        return lines.map((line, index) => {
            // Process Image
            const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
            if (imgMatch) {
                const url = imgMatch[2];
                return (
                    <div key={index} className="my-6 flex flex-col items-center">
                        <img
                            src={url}
                            alt="Tutorial"
                            className="max-w-full rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 cursor-zoom-in hover:scale-[1.01] transition-transform"
                            onClick={(e) => { e.stopPropagation(); setPreviewUrl(url); }}
                        />
                    </div>
                );
            }

            // Process Headers
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-black text-indigo-900 dark:text-indigo-400 mt-8 mb-6 uppercase tracking-tight">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mt-6 mb-4">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-5 mb-3">{line.replace('### ', '')}</h3>;
            }

            // Empty lines
            if (line.trim() === '') return <div key={index} className="h-4" />;

            // Bold and Normal text
            const parts = line.split(/(\*\*.*?\*\*)/);
            return (
                <p key={index} className="text-black dark:text-slate-200 text-lg leading-relaxed mb-4">
                    {parts.map((part, pIdx) => {
                        const boldMatch = part.match(/\*\*(.*?)\*\*/);
                        if (boldMatch) {
                            return <strong key={pIdx} className="font-bold text-black dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{boldMatch[1]}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({ value: content, updated_at: new Date().toISOString() })
                .eq('key', 'help_text');

            if (!error) {
                setIsEditing(false);
            } else {
                alert('Erro ao salvar: ' + error.message);
            }
        } catch (err) {
            console.error('Error saving help content:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Central de Ajuda</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tutoriais e Orientações</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg ${isEditing
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                                    }`}
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : isEditing ? (
                                    <Save className="w-4 h-4" />
                                ) : (
                                    <Edit3 className="w-4 h-4" />
                                )}
                                {isEditing ? 'Salvar Alterações' : 'Editar Conteúdo'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Carregando informações...</p>
                            </div>
                        ) : isEditing ? (
                            <div className="flex flex-col h-full gap-4">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 w-fit">
                                    <button
                                        onClick={() => setEditorTab('write')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editorTab === 'write' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => setEditorTab('preview')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editorTab === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Visualizar
                                    </button>
                                    <button
                                        onClick={() => setEditorTab('split')}
                                        className={`hidden md:block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editorTab === 'split' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Lado a Lado
                                    </button>
                                </div>
                                <div className={`flex-1 min-h-0 grid gap-6 ${editorTab === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                    {(editorTab === 'write' || editorTab === 'split') && (
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full h-full p-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-3xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed resize-none custom-scrollbar shadow-inner"
                                            placeholder="Escreva aqui o tutorial ou orientações para a equipe... Use # para títulos e ** para negrito."
                                        />
                                    )}
                                    {(editorTab === 'preview' || editorTab === 'split') && (
                                        <div className="w-full h-full p-8 bg-white dark:bg-slate-800/20 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl overflow-y-auto custom-scrollbar">
                                            {renderContent(content)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-none">
                                {content ? (
                                    <div className="animate-fade-in shadow-sm rounded-3xl p-4 md:p-8 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-50 dark:border-slate-800">
                                        {renderContent(content)}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                                        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="font-bold uppercase text-xs tracking-widest">Nenhum conteúdo cadastrado.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Tip */}
                {isAdmin && !isEditing && (
                    <div className="px-8 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Dica: Use # para Título, ## para Subtítulo e ** para Negrito.
                    </div>
                )}
            </div>

            {/* Modal de Preview de Imagem */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Visualização da Imagem</h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

