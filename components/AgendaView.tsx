
import React, { useState, useMemo } from 'react';
import { Task, Collaborator, Company, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Building2, CheckCircle2, AlertCircle, PlusCircle, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgendaViewProps {
    tasks: Task[];
    collaborators: Collaborator[];
    companies: Company[];
    onViewTask?: (task: Task) => void;
    onAddClick?: (date: string, mode: 'nova' | 'lembrete') => void;
    onDeleteTask?: (taskId: string) => void;
    isManager: boolean;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ tasks, collaborators, companies, onViewTask, onAddClick, onDeleteTask, isManager }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const tasksByDay = useMemo(() => {
        const map: Record<string, Task[]> = {};
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        tasks.forEach(task => {
            if (!task.dueDate) return;

            let taskStart: Date;
            const parsedDate = new Date(task.dueDate);

            if (!isNaN(parsedDate.getTime())) {
                taskStart = parsedDate;
            } else {
                const parts = task.dueDate.split('-');
                if (parts.length === 3) {
                    const [y, m, d] = parts.map(Number);
                    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                        taskStart = new Date(y, m - 1, d);
                    } else return;
                } else return;
            }

            taskStart.setHours(0, 0, 0, 0);

            // Se não repete, adiciona apenas na data de vencimento
            if (!task.repeatFrequency || task.repeatFrequency === 'none') {
                const year = taskStart.getFullYear();
                const month = String(taskStart.getMonth() + 1).padStart(2, '0');
                const day = String(taskStart.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                if (!map[dateStr]) map[dateStr] = [];
                map[dateStr].push(task);
                return;
            }

            // Para tarefas recorrentes, projetamos as instâncias no mês atual
            const tempDate = new Date(startOfMonth);
            while (tempDate <= endOfMonth) {
                const currentDay = new Date(tempDate);
                currentDay.setHours(0, 0, 0, 0);

                // A recorrência só começa a partir da data de vencimento original
                if (currentDay >= taskStart) {
                    let shouldShow = false;
                    const diffTime = currentDay.getTime() - taskStart.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    if (task.repeatFrequency === 'daily') {
                        shouldShow = true;
                    } else if (task.repeatFrequency === 'weekly') {
                        shouldShow = diffDays % 7 === 0;
                    } else if (task.repeatFrequency === 'monthly') {
                        shouldShow = currentDay.getDate() === taskStart.getDate();
                    }

                    if (shouldShow) {
                        try {
                            const dateStr = currentDay.toISOString().split('T')[0];
                            if (!map[dateStr]) map[dateStr] = [];
                            map[dateStr].push(task);
                        } catch (e) {
                            console.error('Error processing recurring task date:', e);
                        }
                    }
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
        });
        return map;
    }, [tasks, currentDate]);

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days: (Date | null)[] = [];
        const firstDay = firstDayOfMonth(year, month);
        const totalDays = daysInMonth(year, month);

        // Fill empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Fill current month days
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [currentDate]);

    const getSafeMonthName = (date: Date) => {
        const month = date.getMonth();
        return monthNames[month] || `Mês ${month + 1}`;
    };

    const getSafeDateStr = (date: Date) => {
        try {
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.DONE: return 'bg-cyan-500';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-500';
            case TaskStatus.REVIEW: return 'bg-amber-500';
            case TaskStatus.ARCHIVED: return 'bg-slate-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                                {getSafeMonthName(currentDate)} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Visualize sua rotina e prazos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-600">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all text-slate-600 dark:text-slate-300 shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all text-slate-600 dark:text-slate-300 shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-inner">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="bg-slate-50 dark:bg-slate-800/50 py-4 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{day}</span>
                        </div>
                    ))}
                    {calendarDays.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="bg-white dark:bg-slate-800/40 min-h-[120px]" />;

                        const dateStr = getSafeDateStr(date);
                        if (!dateStr) return <div key={`empty-${idx}`} className="bg-white dark:bg-slate-800/40 min-h-[120px]" />;

                        const tasksOnDay = tasksByDay[dateStr] || [];
                        const isToday = getSafeDateStr(new Date()) === dateStr;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => setSelectedDay(date)}
                                className={`bg-white dark:bg-slate-800 min-h-[120px] p-2 transition-all cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 group relative ${isToday ? 'ring-1 ring-inset ring-indigo-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600'
                                        }`}>
                                        {date.getDate()}
                                    </span>
                                    {tasksOnDay.length > 0 && (
                                        <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                                            {tasksOnDay.length}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    {tasksOnDay.slice(0, 3).map(task => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-1.5 px-1.5 py-1 rounded text-[10px] bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 truncate group-hover:border-indigo-100"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(task.status)}`} />
                                            <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{task.title}</span>
                                        </div>
                                    ))}
                                    {tasksOnDay.length > 3 && (
                                        <p className="text-[9px] text-slate-400 font-bold px-1.5 mt-1">
                                            + {tasksOnDay.length - 3} outras
                                        </p>
                                    )}
                                </div>

                                {/* Quick Actions on Hover */}
                                {isManager && (
                                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddClick?.(dateStr, 'lembrete');
                                            }}
                                            title="Lembrete"
                                            className="p-1 px-1.5 bg-amber-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform flex items-center gap-1"
                                        >
                                            <Bell className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddClick?.(dateStr, 'nova');
                                            }}
                                            title="Tarefa"
                                            className="p-1 px-1.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:scale-110 transition-transform flex items-center gap-1"
                                        >
                                            <PlusCircle className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Tasks Modal */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-slate-700 w-14 h-14 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{getSafeMonthName(selectedDay).slice(0, 3)}</span>
                                        <span className="text-xl font-black text-indigo-600 leading-none">{selectedDay.getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                                            Agenda do Dia
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {tasksByDay[getSafeDateStr(selectedDay)]?.length || 0} tarefas programadas
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isManager && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    if (selectedDay) {
                                                        onAddClick?.(getSafeDateStr(selectedDay), 'lembrete');
                                                        setSelectedDay(null);
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all hover:scale-105"
                                            >
                                                <Bell className="w-4 h-4" />
                                                Lembrete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedDay) {
                                                        onAddClick?.(getSafeDateStr(selectedDay), 'nova');
                                                        setSelectedDay(null);
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-105"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Tarefa
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 transition-all hover:scale-105"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                {(() => {
                                    const dateStr = getSafeDateStr(selectedDay);
                                    const dayTasks = tasksByDay[dateStr] || [];

                                    if (dayTasks.length > 0) {
                                        return dayTasks.map(task => {
                                            const assignee = (collaborators || []).find(c => c.id === task.assigneeId);
                                            const company = (companies || []).find(c => c.id === task.companyId);

                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => {
                                                        onViewTask?.(task);
                                                        setSelectedDay(null);
                                                    }}
                                                    className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)} shadow-sm`} />
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                                {task.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter ${task.status === TaskStatus.DONE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                                                }`}>
                                                                {task.status}
                                                            </span>
                                                            {isManager && onDeleteTask && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeleteTask(task.id);
                                                                        setSelectedDay(null); // Close modal after delete attempt or stay? Usually better to close or refresh.
                                                                    }}
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Excluir"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 italic">
                                                        {task.description || 'Sem descrição detalhada.'}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                                        {company && (
                                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                                <Building2 className="w-3.5 h-3.5" />
                                                                {company.name}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            <User className="w-3.5 h-3.5" />
                                                            {assignee?.name}
                                                        </div>
                                                        {task.reminder && (
                                                            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {(() => {
                                                                    try {
                                                                        const rDate = new Date(task.reminder);
                                                                        if (isNaN(rDate.getTime())) return '--:--';
                                                                        return rDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                                    } catch (e) {
                                                                        return '--:--';
                                                                    }
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    }

                                    return (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full">
                                                <CheckCircle2 className="w-12 h-12 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-500 dark:text-slate-300">Nenhuma tarefa para este dia</p>
                                                <p className="text-xs text-slate-400">Aproveite para relaxar ou planejar sua semana!</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
