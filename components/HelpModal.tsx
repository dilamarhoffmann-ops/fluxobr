import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Save, Edit3, Eye, FileText, AlertCircle } from 'lucide-react';
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg ${
                                    isEditing 
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
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed resize-none"
                                placeholder="Escreva aqui o tutorial ou orientações para a equipe..."
                            />
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {content ? (
                                    <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 font-medium leading-loose text-lg">
                                        {content}
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
                        Dica: Use o botão superior para editar este conteúdo para toda a equipe.
                    </div>
                )}
            </div>
        </div>
    );
};

