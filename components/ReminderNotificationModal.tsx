import React, { useEffect, useState } from 'react';
import { X, Bell, Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface ReminderNotificationModalProps {
    isOpen: boolean;
    tasks: Task[];
    onClose: () => void;
    onViewTask: (task: Task) => void;
    onDismiss: (taskId: string) => void;
}

export const ReminderNotificationModal: React.FC<ReminderNotificationModalProps> = ({
    isOpen,
    tasks,
    onClose,
    onViewTask,
    onDismiss
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset index when tasks change
    useEffect(() => {
        if (tasks.length > 0) {
            setCurrentIndex(0);
        }
    }, [tasks.length]);

    if (!isOpen || tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const isLast = currentIndex === tasks.length - 1;

    const handleNext = () => {
        if (!isLast) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handleDismiss = () => {
        onDismiss(currentTask.id);
        if (tasks.length === 1) {
            onClose();
        } else if (currentIndex >= tasks.length - 1) {
            setCurrentIndex(0); // Loop back or just close? better to stay or close.
            // If we dismiss the last one, and there are others, we should probably just shift.
            // But simpler logic: caller removes task from list. Index stays same (unless it was last).
        }
    };

    // We rely on the parent to remove the task from the 'tasks' prop if dismissed.
    // If parent doesn't remove it immediately, we might need internal logic.
    // The prop `tasks` is the list of active reminders.

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col relative animate-scale-in">

                {/* Header with Animation */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-6 border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                        <Bell className="w-32 h-32 text-white" />
                    </div>

                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30 animate-bounce-short">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/90 font-bold text-sm tracking-wide uppercase">Lembrete</span>
                    </div>

                    <h3 className="text-xl font-black text-white leading-tight relative z-10 line-clamp-2">
                        {currentTask.title}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                            {currentTask.description && (
                                <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    {currentTask.description}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {currentTask.reminder ? new Date(currentTask.reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'Sem data'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation / Counter */}
                    {tasks.length > 1 && (
                        <div className="flex justify-center gap-1 mb-2">
                            {tasks.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={() => {
                            onViewTask(currentTask);
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                        Ver Detalhes
                    </button>

                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar
                    </button>
                </div>

                {/* Close Button absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
