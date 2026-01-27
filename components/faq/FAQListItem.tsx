
import React from 'react';
import { ChevronRight, Edit2, Trash2, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQItem } from '../../types';
import { FAQMarkdown } from './FAQMarkdown';
import { isImageFile } from '../../lib/faqUtils';

interface FAQListItemProps {
    faq: FAQItem;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPreviewImage: (url: string) => void;
    canManage: boolean;
}

export const FAQListItem: React.FC<FAQListItemProps> = ({
    faq,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onPreviewImage,
    canManage
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${isExpanded ? 'border-indigo-200 ring-4 ring-indigo-50/50 z-10' : 'border-slate-100 hover:border-slate-200'
                }`}
        >
            <div
                onClick={onToggle}
                className={`flex items-center justify-between p-5 cursor-pointer select-none group ${isExpanded ? 'bg-slate-50/50' : ''
                    }`}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex-shrink-0"
                    >
                        <ChevronRight
                            className={`w-5 h-5 ${isExpanded ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                        />
                    </motion.div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <h3
                            className={`text-base font-bold transition-colors ${isExpanded ? 'text-indigo-600' : 'text-black group-hover:text-indigo-700'
                                }`}
                        >
                            {faq.question.replace(/^Q:/, 'P:').replace(/^Question:/, 'P:')}
                        </h3>
                    </div>
                </div>

                {canManage && (
                    <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={onEdit}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Editar"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-14 pb-8 space-y-6">
                            <div className="h-px bg-gradient-to-r from-indigo-100 via-slate-100 to-transparent w-full"></div>

                            <div className="text-slate-700 leading-relaxed">
                                <FAQMarkdown content={faq.answer} onPreviewImage={onPreviewImage} />
                            </div>

                            {(faq.url || faq.pdfUrl || faq.imageUrl) && (
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50">
                                    {faq.url && (
                                        <div className="flex items-center gap-2">
                                            {isImageFile(faq.url) ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onPreviewImage(faq.url!);
                                                    }}
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100/50 shadow-sm"
                                                >
                                                    <ImageIcon className="w-4 h-4" /> Ver Imagem Externa
                                                </button>
                                            ) : (
                                                <a
                                                    href={faq.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100/50 shadow-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" /> Documentação Externa
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {faq.pdfUrl && (
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={faq.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm"
                                            >
                                                <FileText className="w-4 h-4" /> Visualizar PDF
                                            </a>
                                        </div>
                                    )}
                                    {faq.imageUrl && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onPreviewImage(faq.imageUrl!);
                                                }}
                                                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-amber-100 transition-all border border-amber-100/50 shadow-sm"
                                            >
                                                <ImageIcon className="w-4 h-4" /> Ver Imagem Anexada
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
