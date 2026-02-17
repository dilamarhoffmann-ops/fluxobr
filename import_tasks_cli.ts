/**
 * Script para importar tarefas do arquivo DOCX para o banco de dados
 * Cria um TaskTemplate com todas as tarefas e subtarefas
 * 
 * IMPORTANTE: Execute este script através da interface web do sistema
 * para garantir que o usuário esteja autenticado.
 * 
 * Ou execute com: npx tsx import_tasks_cli.ts <user_id>
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Ler variáveis de ambiente do arquivo .env.local se existir
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas');
    console.error('   Crie um arquivo .env.local com:');
    console.error('   VITE_SUPABASE_URL=sua_url');
    console.error('   VITE_SUPABASE_ANON_KEY=sua_chave');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function importTasksToSupabase(userId?: string) {
    try {
        // Ler arquivo JSON processado
        const jsonPath = path.join(process.cwd(), 'tarefas_processadas.json');

        if (!fs.existsSync(jsonPath)) {
            console.error('❌ Erro: Arquivo tarefas_processadas.json não encontrado');
            console.error('   Execute primeiro: powershell -ExecutionPolicy Bypass -File .\\extract_to_json.ps1');
            console.error('   E depois: powershell -ExecutionPolicy Bypass -File .\\process_tasks.ps1');
            process.exit(1);
        }

        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data: ProcessedData = JSON.parse(jsonContent);

        console.log('📋 Dados carregados:');
        console.log(`   Total de tarefas: ${data.totalTasks}`);
        console.log('');

        // Se não foi fornecido userId, perguntar
        if (!userId) {
            console.log('⚠️  Para criar o template, precisamos do ID do usuário.');
            console.log('   Você pode encontrar seu ID no sistema ou deixar em branco (será NULL).');
            userId = await promptUser('Digite o ID do usuário (ou Enter para pular): ');
            if (!userId.trim()) {
                userId = undefined;
            }
        }

        // Criar o Template principal
        console.log('🔨 Criando template "Tarefas Squad"...');

        const { data: templateData, error: templateError } = await supabase
            .from('task_templates')
            .insert({
                name: 'Tarefas Squad',
                description: `Template importado do arquivo "taredas squad.docx" em ${data.processedAt}. Contém ${data.totalTasks} tarefas principais.`,
                created_by: userId || null
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

            // Mostrar progresso
            const progress = Math.round((createdTasks / data.totalTasks) * 100);
            process.stdout.write(`\r   Progresso: ${progress}% (${createdTasks}/${data.totalTasks})`);

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

        console.log('\n');
        console.log('✅ Importação concluída!');
        console.log(`   📊 Estatísticas:`);
        console.log(`      - Template ID: ${templateData.id}`);
        console.log(`      - Template Nome: ${templateData.name}`);
        console.log(`      - Tarefas criadas: ${createdTasks}/${data.totalTasks}`);
        console.log(`      - Atividades criadas: ${createdActivities}`);
        console.log('');
        console.log('🎉 Você pode agora usar este template no sistema!');
        console.log('   Acesse: Configurações > Modelos > "Tarefas Squad"');

    } catch (error) {
        console.error('❌ Erro geral:', error);
        process.exit(1);
    }
}

// Executar importação
const userId = process.argv[2];
importTasksToSupabase(userId);
