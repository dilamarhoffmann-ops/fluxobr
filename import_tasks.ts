/**
 * Script para importar tarefas do arquivo DOCX para o banco de dados
 * Cria um TaskTemplate com todas as tarefas e subtarefas
 */

import { supabase } from './lib/supabase';
import * as fs from 'fs';
import * as path from 'path';


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

async function importTasksToSupabase() {
    try {
        // Ler arquivo JSON processado
        const jsonPath = path.join(__dirname, 'tarefas_processadas.json');
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data: ProcessedData = JSON.parse(jsonContent);

        console.log('📋 Dados carregados:');
        console.log(`   Total de tarefas: ${data.totalTasks}`);
        console.log('');

        // Criar o Template principal
        console.log('🔨 Criando template "Tarefas Squad"...');

        const { data: templateData, error: templateError } = await supabase
            .from('task_templates')
            .insert({
                name: 'Tarefas Squad',
                description: `Template importado do arquivo "taredas squad.docx" em ${data.processedAt}`,
                created_by: null // Será preenchido pelo usuário logado
            })
            .select()
            .single();

        if (templateError) {
            console.error('❌ Erro ao criar template:', templateError);
            return;
        }

        console.log(`✅ Template criado com ID: ${templateData.id}`);
        console.log('');

        // Criar as tarefas do template
        console.log('🔨 Criando tarefas do template...');
        let createdTasks = 0;
        let createdActivities = 0;

        for (const task of data.tasks) {
            // Inserir tarefa
            const { data: taskData, error: taskError } = await supabase
                .from('template_tasks')
                .insert({
                    template_id: templateData.id,
                    title: task.title,
                    description: `Tarefa ${task.number}`,
                    priority: 'Média' // Prioridade padrão
                })
                .select()
                .single();

            if (taskError) {
                console.error(`❌ Erro ao criar tarefa "${task.title}":`, taskError);
                continue;
            }

            createdTasks++;
            console.log(`   ✓ Tarefa ${task.number}: ${task.title.substring(0, 50)}...`);

            // Inserir subtarefas como atividades
            if (task.subtasks && task.subtasks.length > 0) {
                for (const subtask of task.subtasks) {
                    const { error: activityError } = await supabase
                        .from('template_activities')
                        .insert({
                            template_task_id: taskData.id,
                            title: subtask
                        });

                    if (activityError) {
                        console.error(`   ❌ Erro ao criar atividade "${subtask}":`, activityError);
                    } else {
                        createdActivities++;
                    }
                }
            }
        }

        console.log('');
        console.log('✅ Importação concluída!');
        console.log(`   📊 Estatísticas:`);
        console.log(`      - Template ID: ${templateData.id}`);
        console.log(`      - Tarefas criadas: ${createdTasks}/${data.totalTasks}`);
        console.log(`      - Atividades criadas: ${createdActivities}`);
        console.log('');
        console.log('🎉 Você pode agora usar este template no sistema!');

    } catch (error) {
        console.error('❌ Erro geral:', error);
        process.exit(1);
    }
}

// Executar importação
importTasksToSupabase();
