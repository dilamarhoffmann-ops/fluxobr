
import { X, ExternalLink, HelpCircle, FileText, Download } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQItem | null;
}

export const FAQViewModal: React.FC<FAQViewModalProps> = ({ isOpen, onClose, faq }) => {
  if (!isOpen || !faq) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            FAQ Relacionada
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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

            {faq.pdfUrl && (
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
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors mb-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
