/**
 * Componente para importar tarefas do arquivo JSON processado
 * Cria um TaskTemplate com todas as tarefas e subtarefas
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TaskData {
    number: number;
    title: string;
    subtasks: string[];
}

interface ProcessedData {
    processedAt: string;
    totalTasks: number;
    tasks: TaskData[];
}

interface ImportTasksProps {
    userId?: string;
    onComplete?: (templateId: string) => void;
}

export const ImportTasksFromJSON: React.FC<ImportTasksProps> = ({ userId, onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState<{
        templateId?: string;
        templateName?: string;
        tasksCreated: number;
        activitiesCreated: number;
        totalTasks: number;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
            setStats(null);
        }
    };

    const importTasks = async () => {
        if (!file) {
            setStatus('error');
            setMessage('Por favor, selecione um arquivo JSON');
            return;
        }

        setImporting(true);
        setProgress(0);
        setStatus('idle');

        try {
            // Ler arquivo JSON
            const text = await file.text();
            const data: ProcessedData = JSON.parse(text);

            setMessage(`Carregado: ${data.totalTasks} tarefas`);
            setProgress(5);

            // Criar o Template principal
            const { data: templateData, error: templateError } = await supabase
                .from('task_templates')
                .insert({
                    name: 'Tarefas Squad',
                    description: `Template importado do arquivo "${file.name}" em ${new Date().toISOString()}. Contém ${data.totalTasks} tarefas principais.`,
                    created_by: userId || null
                })
                .select()
                .single();

            if (templateError) {
                throw new Error(`Erro ao criar template: ${templateError.message}`);
            }

            setMessage(`Template criado: ${templateData.name}`);
            setProgress(10);

            // Criar as tarefas do template
            let createdTasks = 0;
            let createdActivities = 0;

            for (let i = 0; i < data.tasks.length; i++) {
                const task = data.tasks[i];

                // Inserir tarefa
                const { data: taskData, error: taskError } = await supabase
                    .from('template_tasks')
                    .insert({
                        template_id: templateData.id,
                        title: task.title,
                        description: `Tarefa ${task.number}`,
                        priority: 'Média'
                    })
                    .select()
                    .single();

                if (taskError) {
                    console.error(`Erro ao criar tarefa "${task.title}":`, taskError);
                    continue;
                }

                createdTasks++;

                // Atualizar progresso (10% a 90%)
                const taskProgress = 10 + ((i + 1) / data.totalTasks) * 80;
                setProgress(Math.round(taskProgress));
                setMessage(`Criando tarefas: ${createdTasks}/${data.totalTasks}`);

                // Inserir subtarefas como atividades
                if (task.subtasks && task.subtasks.length > 0) {
                    for (const subtask of task.subtasks) {
                        const { error: activityError } = await supabase
                            .from('template_activities')
                            .insert({
                                template_task_id: taskData.id,
                                title: subtask
                            });

                        if (!activityError) {
                            createdActivities++;
                        }
                    }
                }
            }

            setProgress(100);
            setStatus('success');
            setMessage('Importação concluída com sucesso!');
            setStats({
                templateId: templateData.id,
                templateName: templateData.name,
                tasksCreated: createdTasks,
                activitiesCreated: createdActivities,
                totalTasks: data.totalTasks
            });

            if (onComplete) {
                onComplete(templateData.id);
            }

        } catch (error: any) {
            setStatus('error');
            setMessage(`Erro: ${error.message}`);
            console.error('Erro na importação:', error);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Importar Tarefas do JSON
            </h2>

            <div className="space-y-6">
                {/* File Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Arquivo JSON (tarefas_processadas.json)
                    </label>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        disabled={importing}
                        className="block w-full text-sm text-slate-500 dark:text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800
              disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {file && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Arquivo selecionado: {file.name}
                        </p>
                    )}
                </div>

                {/* Import Button */}
                <button
                    onClick={importTasks}
                    disabled={!file || importing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {importing ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Importando...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Importar Tarefas
                        </>
                    )}
                </button>

                {/* Progress Bar */}
                {importing && (
                    <div className="space-y-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                            {progress}% - {message}
                        </p>
                    </div>
                )}

                {/* Status Message */}
                {status !== 'idle' && !importing && (
                    <div className={`flex items-start gap-3 p-4 rounded-lg ${status === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                        {status === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium">{message}</p>
                            {stats && (
                                <div className="mt-2 text-sm space-y-1">
                                    <p>• Template: {stats.templateName} (ID: {stats.templateId})</p>
                                    <p>• Tarefas criadas: {stats.tasksCreated}/{stats.totalTasks}</p>
                                    <p>• Atividades criadas: {stats.activitiesCreated}</p>
                                    <p className="mt-2 font-medium">
                                        ✅ Acesse: Configurações → Modelos → "Tarefas Squad"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        📋 Como usar:
                    </h3>
                    <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                        <li>Selecione o arquivo <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">tarefas_processadas.json</code></li>
                        <li>Clique em "Importar Tarefas"</li>
                        <li>Aguarde a conclusão da importação</li>
                        <li>O template estará disponível em Configurações → Modelos</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
