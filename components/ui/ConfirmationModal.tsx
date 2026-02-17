import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'warning'
}) => {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
            bg: 'bg-rose-500',
            text: 'text-rose-600',
            border: 'border-rose-100',
            button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
        },
        warning: {
            icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
            bg: 'bg-amber-500',
            text: 'text-amber-600',
            border: 'border-amber-100',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
        },
        info: {
            icon: <CheckCircle2 className="w-6 h-6 text-indigo-500" />,
            bg: 'bg-indigo-500',
            text: 'text-indigo-600',
            border: 'border-indigo-100',
            button: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200'
        }
    };

    const style = variants[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${style.bg}/10 ${style.border} border`}>
                            {style.icon}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors border border-slate-100 dark:border-slate-800"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg ${style.button}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
