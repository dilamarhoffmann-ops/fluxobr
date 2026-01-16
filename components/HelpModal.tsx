import React from 'react';
import { X, HelpCircle, ExternalLink } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const pdfUrl = "https://wwedununqkjllxrjlcnc.supabase.co/storage/v1/object/public/task-attachments/faq-1768502439407-___Tutorial_do_Usu_rio.pdf";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Tutorial do Usuário
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto relative custom-scrollbar">
                    <iframe
                        src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        className="w-full h-full min-h-[60vh] border-0"
                        title="Tutorial do Usuário"
                    >
                        <div className="p-12 text-center">
                            <p className="text-slate-500 mb-4">
                                Seu navegador não suporta visualização direta de PDF.
                            </p>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Abrir Tutorial em Nova Guia
                            </a>
                        </div>
                    </iframe>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                        <ExternalLink className="w-3 h-3" /> Problemas com a visualização? Clique aqui para abrir em tela cheia.
                    </a>
                </div>
            </div>
        </div>
    );
};
