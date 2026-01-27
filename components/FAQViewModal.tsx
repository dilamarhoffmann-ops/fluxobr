
import React, { useState } from 'react';
import { X, ExternalLink, HelpCircle, FileText, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQItem } from '../types';
import { FAQMarkdown } from './faq/FAQMarkdown';
import { isImageFile, copyToClipboard } from '../lib/faqUtils';

interface FAQViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQItem | null;
}

export const FAQViewModal: React.FC<FAQViewModalProps> = ({ isOpen, onClose, faq }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !faq) return null;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20 dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-indigo-600" />
                    FAQ Relacionada
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Base de Conhecimento</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
                <div className="space-y-6">
                  <div>
                    <span className="text-indigo-600 font-black italic text-xl block mb-2">P:</span>
                    <p className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-tight">
                      {faq.question.replace(/^Q:/, '').replace(/^P:/, '').trim()}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                  <div>
                    <span className="text-emerald-600 font-black italic text-xl block mb-2">R:</span>
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed overflow-hidden font-medium">
                      <FAQMarkdown content={faq.answer} onPreviewImage={setPreviewUrl} />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  {faq.url && (
                    <div className="flex items-center gap-2">
                      {isImageFile(faq.url) ? (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(faq.url!)}
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all font-bold text-xs border border-indigo-100/50 shadow-sm shadow-indigo-500/5"
                        >
                          <ImageIcon className="w-4 h-4" /> Visualizar Imagem Externa
                        </button>
                      ) : (
                        <a
                          href={faq.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all font-bold text-xs border border-indigo-100/50 shadow-sm shadow-indigo-500/5"
                        >
                          <ExternalLink className="w-4 h-4" /> Documentação Wiki
                        </a>
                      )}
                    </div>
                  )}

                  {faq.pdfUrl && (
                    <a
                      href={faq.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-all font-bold text-xs border border-emerald-100/50 shadow-sm shadow-emerald-500/5"
                    >
                      <FileText className="w-4 h-4" /> Visualizar PDF Detalhado
                    </a>
                  )}

                  {faq.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(faq.imageUrl!)}
                      className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-5 py-2.5 rounded-xl hover:bg-amber-100 transition-all font-bold text-xs border border-amber-100/50 shadow-sm shadow-amber-500/5"
                    >
                      <ImageIcon className="w-4 h-4" /> Ver Anexo de Imagem
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(faq.answer)}
                    className="ml-auto inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar Resposta'}
                  </button>
                </div>
              </div>

              <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end sticky bottom-0 z-10">
                <button
                  onClick={onClose}
                  className="px-10 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition-all active:scale-95 shadow-2xl shadow-slate-500/20"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Image Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Visualização Ampliada</h3>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center shadow-inner">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
