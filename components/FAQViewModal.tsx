
import React, { useState } from 'react';
import { X, ExternalLink, HelpCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQItem | null;
}

export const FAQViewModal: React.FC<FAQViewModalProps> = ({ isOpen, onClose, faq }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen || !faq) return null;

  const isImageFile = (url: string | undefined | null) => {
    if (!url) return false;
    const cleanUrl = url.trim().split(/[?#]/)[0].toLowerCase();
    return cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.webp') ||
      cleanUrl.endsWith('.gif') ||
      cleanUrl.endsWith('.svg') ||
      cleanUrl.endsWith('.avif') ||
      cleanUrl.endsWith('.bmp');
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]">
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10 rounded-t-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              FAQ Relacionada
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Pergunta</h4>
              <p className="text-slate-700 dark:text-slate-300 text-lg">{faq.question}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Resposta / Orientação</h4>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {faq.url && (
                <>
                  {isImageFile(faq.url) ? (
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(faq.url!)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Visualizar Imagem Externa
                    </button>
                  ) : (
                    <a
                      href={faq.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Acessar Documentação Externa
                    </a>
                  )}
                </>
              )}

              {faq.pdfUrl && (
                <>
                  {isImageFile(faq.pdfUrl) ? (
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(faq.pdfUrl!)}
                      className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Visualizar Imagem Anexada
                    </button>
                  ) : (
                    <a
                      href={faq.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Visualizar PDF Anexado
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end sticky bottom-0 z-10 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-all active:scale-95 shadow-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Preview de Imagem (Sobreposto ao FAQViewModal) */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800">Visualização do Anexo</h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-slate-50 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
