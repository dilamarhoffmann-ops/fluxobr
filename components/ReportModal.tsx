
import React, { useState } from 'react';
import { X, Download, Calendar, User, Building2, CheckCircle2, FileText, Loader2, Check } from 'lucide-react';
import { Task, Collaborator, Company, TaskStatus } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    collaborators: Collaborator[];
    companies: Company[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    tasks,
    collaborators,
    companies
}) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const toggleCollaborator = (id: string) => {
        setSelectedCollaboratorIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleCompany = (id: string) => {
        setSelectedCompanyIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleStatus = (status: TaskStatus) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]
        );
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            // Task date string (YYYY-MM-DD) for robust comparison
            const taskDate = task.dueDate ? task.dueDate.split('T')[0] : '';

            // Date Filter
            if (startDate && taskDate < startDate) return false;
            if (endDate && taskDate > endDate) return false;

            // Collaborator Filter
            if (selectedCollaboratorIds.length > 0 && !selectedCollaboratorIds.includes(task.assigneeId)) return false;

            // Company Filter
            if (selectedCompanyIds.length > 0 && !selectedCompanyIds.includes(task.companyId)) return false;

            // Status Filter
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) return false;

            return true;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    };

    const generateReport = async () => {
        setIsGenerating(true);

        try {
            const filteredTasks = getFilteredTasks();

            // 2. Setup PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;

            // Header
            doc.setFontSize(22);
            doc.setTextColor(30, 27, 75); // indigo-950
            doc.text('Relatório de Produtividade', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            const now = new Date().toLocaleString('pt-BR');
            doc.text(`Gerado em: ${now}`, 14, 28);

            // Filters Summary
            let filterText = 'Filtros aplicados: ';
            const filters = [];
            if (startDate || endDate) filters.push(`Período: ${startDate || 'Início'} até ${endDate || 'Fim'}`);
            if (selectedCollaboratorIds.length > 0) filters.push(`Colaboradores: ${selectedCollaboratorIds.length}`);
            if (selectedCompanyIds.length > 0) filters.push(`Empresas: ${selectedCompanyIds.length}`);
            if (selectedStatuses.length > 0) filters.push(`Status: ${selectedStatuses.length}`);
            if (filters.length === 0) filterText += 'Nenhum (Todas as tarefas)';
            else filterText += filters.join(' | ');

            doc.setFontSize(9);
            doc.text(filterText, 14, 35);

            // Tasks Table
            const tableData = filteredTasks.map(task => [
                task.title,
                companies.find(c => c.id === task.companyId)?.name || 'N/A',
                collaborators.find(c => c.id === task.assigneeId)?.name || 'N/A',
                task.dueDate ? task.dueDate.split('T')[0].split('-').reverse().join('/') : 'N/A',
                task.status,
                task.priority
            ]);

            autoTable(doc, {
                startY: 40,
                head: [['Tarefa', 'Empresa', 'Responsável', 'Prazo', 'Status', 'Prioridade']],
                body: tableData,
                headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' }, // indigo-600
                alternateRowStyles: { fillColor: [249, 250, 251] },
                styles: { fontSize: 8, cellPadding: 3 },
                margin: { top: 20 },
                columnStyles: {
                    0: { cellWidth: 50 },
                    4: { cellWidth: 25 }
                }
            });

            // Footer / Summary
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            const completedCount = filteredTasks.filter(t => t.status === TaskStatus.DONE).length;
            const pendingCount = filteredTasks.length - completedCount;
            const completionRate = filteredTasks.length > 0 ? (completedCount / filteredTasks.length * 100).toFixed(1) : 0;

            doc.setDrawColor(229, 231, 235);
            doc.line(14, finalY - 5, pageWidth - 14, finalY - 5);

            doc.setFontSize(11);
            doc.setTextColor(30, 27, 75);
            doc.text('Resumo do Relatório', 14, finalY);

            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            doc.text(`Total de Tarefas: ${filteredTasks.length}`, 14, finalY + 8);
            doc.text(`Concluídas: ${completedCount}`, 14, finalY + 14);
            doc.text(`Pendentes/Outras: ${pendingCount}`, 14, finalY + 20);
            doc.text(`Taxa de Conclusão: ${completionRate}%`, 14, finalY + 26);

            doc.save(`Relatorio_FluxoBR_${new Date().getTime()}.pdf`);
            onClose();
        } catch (err) {
            console.error('Erro ao gerar relatório:', err);
            alert('Erro ao gerar relatório. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToCSV = () => {
        const filteredTasks = getFilteredTasks();

        const csvData = filteredTasks.map(task => ({
            'Tarefa': task.title,
            'Descrição': task.description,
            'Empresa': companies.find(c => c.id === task.companyId)?.name || 'N/A',
            'Responsável': collaborators.find(c => c.id === task.assigneeId)?.name || 'N/A',
            'Prazo': task.dueDate ? task.dueDate.split('T')[0].split('-').reverse().join('/') : 'N/A',
            'Status': task.status,
            'Prioridade': task.priority,
            'Notas': task.notes || ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Relatorio_FluxoBR_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gerar Relatório</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filtre as tarefas para exportação</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Date Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Período de Vencimento
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data Inicial</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-100"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data Final</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Collaborator Filter */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Colaboradores
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCollaboratorIds(collaborators.map(c => c.id))}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase"
                                    >
                                        Todos
                                    </button>
                                    <span className="text-slate-300 text-[10px]">|</span>
                                    <button
                                        onClick={() => setSelectedCollaboratorIds([])}
                                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase"
                                    >
                                        Limpar
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {collaborators.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => toggleCollaborator(c.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedCollaboratorIds.includes(c.id)
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <span className="truncate">{c.name}</span>
                                        {selectedCollaboratorIds.includes(c.id) && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Company Filter */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5" /> Empresas
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCompanyIds(companies.map(c => c.id))}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase"
                                    >
                                        Todas
                                    </button>
                                    <span className="text-slate-300 text-[10px]">|</span>
                                    <button
                                        onClick={() => setSelectedCompanyIds([])}
                                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase"
                                    >
                                        Limpar
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {companies.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => toggleCompany(c.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedCompanyIds.includes(c.id)
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <span className="truncate">{c.name}</span>
                                        {selectedCompanyIds.includes(c.id) && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Status
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedStatuses(Object.values(TaskStatus))}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase"
                                    >
                                        Todos
                                    </button>
                                    <span className="text-slate-300 text-[10px]">|</span>
                                    <button
                                        onClick={() => setSelectedStatuses([])}
                                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase"
                                    >
                                        Limpar
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {Object.values(TaskStatus).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => toggleStatus(status)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedStatuses.includes(status)
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <span className="truncate">{status}</span>
                                        {selectedStatuses.includes(status) && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                <strong>Dica:</strong> Se nenhum colaborador ou empresa for selecionado, o relatório incluirá todos os registros dentro do período escolhido.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 items-center">
                    <span className="mr-auto text-xs font-semibold text-slate-400">
                        {tasks.length} tarefas totais disponíveis
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all"
                    >
                        Exportar CSV
                    </button>
                    <button
                        onClick={generateReport}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Exportar PDF Premium
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
