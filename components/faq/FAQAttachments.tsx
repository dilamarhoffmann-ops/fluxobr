
import React from 'react';
import { Paperclip, Loader2, Trash2, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react';
import { isImageFile } from '../../lib/faqUtils';
import { storage } from '../../lib/supabase';

interface FAQAttachmentsProps {
    attachments: any[];
    isLoading: boolean;
    onDelete: (fileName: string) => void;
    onPreviewImage: (url: string) => void;
}

export const FAQAttachments: React.FC<FAQAttachmentsProps> = ({
    attachments,
    isLoading,
    onDelete,
    onPreviewImage
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
                <p className="text-slate-500 font-medium">Carregando documentos...</p>
            </div>
        );
    }

    return (
        <div className="mt-16 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Paperclip className="w-6 h-6 text-indigo-600" />
                        Central de Arquivos
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Gerencie todos os anexos vinculados à base de conhecimento.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                    <span className="text-indigo-700 font-bold text-sm">{attachments.length} Arquivos</span>
                </div>
            </div>

            {attachments.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Nenhum documento anexado ainda.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nome do Arquivo</th>
                                    <th className="px-8 py-5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Data de Upload</th>
                                    <th className="px-8 py-5 text-right text-slate-500 font-bold uppercase tracking-widest text-[10px]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {attachments.map((file) => {
                                    const fileNameOnly = file.name;
                                    const publicUrl = storage.getPublicUrl('task-attachments', file.name);
                                    const isImage = isImageFile(file.name);

                                    return (
                                        <tr key={file.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isImage ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                        {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                    </div>
                                                    <span className="font-bold text-slate-700 truncate max-w-[300px]" title={fileNameOnly}>
                                                        {fileNameOnly}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">
                                                {new Date(file.created_at).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isImage ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => onPreviewImage(publicUrl)}
                                                            className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-indigo-600 shadow-sm border border-slate-100 transition-all font-bold"
                                                            title="Visualizar Imagem"
                                                        >
                                                            <ImageIcon className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <a
                                                            href={publicUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-indigo-600 shadow-sm border border-slate-100 transition-all font-bold"
                                                            title="Abrir em Nova Aba"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => onDelete(file.name)}
                                                        className="p-2.5 bg-white hover:bg-red-600 hover:text-white rounded-xl text-red-500 shadow-sm border border-slate-100 transition-all font-bold"
                                                        title="Excluir Permanentemente"
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
    );
};
