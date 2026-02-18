
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CRON_SECRET = Deno.env.get('CRON_SECRET')

// Helper function to log notifications to database
async function logNotification(
    supabase: any,
    taskId: string,
    recipientEmail: string,
    recipientType: 'assignee' | 'manager' | 'admin',
    status: 'success' | 'failed',
    emailSubject: string,
    resendId?: string,
    errorMessage?: string
) {
    try {
        await supabase.from('notification_logs').insert({
            task_id: taskId,
            recipient_email: recipientEmail,
            recipient_type: recipientType,
            status,
            email_subject: emailSubject,
            resend_id: resendId,
            error_message: errorMessage
        })
    } catch (err) {
        console.error('Failed to log notification:', err)
    }
}

// Helper function to send email via Resend
async function sendEmail(emailContent: any): Promise<{ success: boolean, id?: string, error?: string }> {
    if (!RESEND_API_KEY) {
        console.log("RESEND_API_KEY não configurada. Logando email:", emailContent)
        return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    try {
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(emailContent),
        })

        const result = await emailRes.json()

        if (!emailRes.ok) {
            return { success: false, error: result.message || 'Email send failed' }
        }

        return { success: true, id: result.id }
    } catch (err) {
        return { success: false, error: err.message }
    }
}

Deno.serve(async (req) => {
    // ✅ SECURITY: Verificar token de autorização antes de qualquer operação
    const authHeader = req.headers.get('Authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Configuração do cliente Supabase com Service Role para ignorar RLS
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    try {
        // 1. Buscar tarefas que precisam ser notificadas
        // Inclui tarefas vencidas não notificadas OU tarefas que precisam de re-notificação (escalação)
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        status,
        due_date,
        assignee_id,
        due_notification_sent,
        last_notification_date,
        assignee:profiles!assignee_id (
          id,
          full_name,
          email,
          role,
          access_level
        )
      `)
            .lte('due_date', new Date().toISOString())
            .not('status', 'in', '(Concluído,Arquivado)')

        if (tasksError) throw tasksError

        console.log(`Encontradas ${tasks?.length || 0} tarefas vencidas para análise.`)

        const results = []
        let processedCount = 0

        for (const task of tasks || []) {
            const assignee = task.assignee as any
            if (!assignee) {
                console.log(`Task ${task.id} sem responsável atribuído. Pulando.`)
                continue
            }

            // Check if task should be notified using escalation logic
            const { data: shouldNotify } = await supabase.rpc('should_renotify_task', { task_id: task.id })

            if (!shouldNotify) {
                console.log(`Task ${task.id} não precisa de notificação no momento.`)
                continue
            }

            processedCount++
            const daysOverdue = Math.floor((Date.now() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24))
            const urgencyLevel = daysOverdue >= 7 ? '🚨 URGENTE' : daysOverdue >= 3 ? '⚠️ ATENÇÃO' : '🔔'

            // 2. Notify the assignee (task owner)
            if (assignee.email) {
                const assigneeEmailContent = {
                    from: 'FluxoBR <onboarding@resend.dev>',
                    to: assignee.email,
                    subject: `${urgencyLevel} Sua tarefa "${task.title}" está vencida`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #1e293b; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Tarefa Vencida - FluxoBR</h2>
              <p>Olá <strong>${assignee.full_name}</strong>,</p>
              <p>A seguinte tarefa sob sua responsabilidade está <strong style="color: #ef4444;">vencida há ${daysOverdue} dia(s)</strong>:</p>
              
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Tarefa:</strong> ${task.title}</p>
                ${task.description ? `<p style="margin: 5px 0;"><strong>Descrição:</strong> ${task.description}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Prazo:</strong> ${new Date(task.due_date).toLocaleDateString('pt-BR')}</p>
                <p style="margin: 5px 0;"><strong>Status Atual:</strong> <span style="color: #f59e0b; font-weight: bold;">${task.status}</span></p>
                <p style="margin: 5px 0;"><strong>Dias de Atraso:</strong> <span style="color: #ef4444; font-weight: bold;">${daysOverdue}</span></p>
              </div>

              <p>Por favor, acesse o dashboard para atualizar o status ou ajustar o cronograma.</p>
              
              <div style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
                Este é um e-mail automático enviado pelo FluxoBR Dashboard.
              </div>
            </div>
          `,
                }

                const assigneeResult = await sendEmail(assigneeEmailContent)
                await logNotification(
                    supabase,
                    task.id,
                    assignee.email,
                    'assignee',
                    assigneeResult.success ? 'success' : 'failed',
                    assigneeEmailContent.subject,
                    assigneeResult.id,
                    assigneeResult.error
                )

                results.push({
                    taskId: task.id,
                    recipient: assignee.email,
                    type: 'assignee',
                    result: assigneeResult
                })
            }

            // 3. Buscar gestores/admins do mesmo squad/role
            const { data: managers, error: managersError } = await supabase
                .from('profiles')
                .select('id, email, full_name, access_level')
                .eq('role', assignee.role)
                .in('access_level', ['gestor', 'admin'])
                .neq('id', assignee.id) // Don't send duplicate to assignee if they're also a manager

            if (managersError) {
                console.error(`Erro ao buscar gestores para task ${task.id}:`, managersError)
            } else if (managers && managers.length > 0) {
                // 4. Enviar e-mail para cada gestor
                for (const manager of managers) {
                    if (!manager.email) continue

                    const managerEmailContent = {
                        from: 'FluxoBR <onboarding@resend.dev>',
                        to: manager.email,
                        subject: `${urgencyLevel} Alerta de Prazo: Tarefa "${task.title}"`,
                        html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Monitoramento de Prazos FluxoBR</h2>
                <p>Olá <strong>${manager.full_name}</strong>,</p>
                <p>A seguinte tarefa da sua equipe está <strong style="color: #ef4444;">vencida há ${daysOverdue} dia(s)</strong>:</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Tarefa:</strong> ${task.title}</p>
                  ${task.description ? `<p style="margin: 5px 0;"><strong>Descrição:</strong> ${task.description}</p>` : ''}
                  <p style="margin: 5px 0;"><strong>Responsável:</strong> ${assignee.full_name} (${assignee.role})</p>
                  <p style="margin: 5px 0;"><strong>Prazo:</strong> ${new Date(task.due_date).toLocaleDateString('pt-BR')}</p>
                  <p style="margin: 5px 0;"><strong>Status Atual:</strong> <span style="color: ${task.status === 'Concluído' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${task.status}</span></p>
                  <p style="margin: 5px 0;"><strong>Dias de Atraso:</strong> <span style="color: #ef4444; font-weight: bold;">${daysOverdue}</span></p>
                </div>

                <p>Por favor, acesse o dashboard para revisar a entrega ou ajustar o cronograma, se necessário.</p>
                
                <div style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
                  Este é um e-mail automático enviado pelo FluxoBR Dashboard.
                </div>
              </div>
            `,
                    }

                    const managerResult = await sendEmail(managerEmailContent)
                    await logNotification(
                        supabase,
                        task.id,
                        manager.email,
                        manager.access_level === 'admin' ? 'admin' : 'manager',
                        managerResult.success ? 'success' : 'failed',
                        managerEmailContent.subject,
                        managerResult.id,
                        managerResult.error
                    )

                    results.push({
                        taskId: task.id,
                        recipient: manager.email,
                        type: manager.access_level,
                        result: managerResult
                    })
                }
            }

            // 5. Atualizar flags de notificação na tarefa
            await supabase
                .from('tasks')
                .update({
                    due_notification_sent: true,
                    last_notification_date: new Date().toISOString()
                })
                .eq('id', task.id)
        }

        // Get notification statistics
        const { data: stats } = await supabase.rpc('get_notification_stats', { days_back: 30 })

        return new Response(JSON.stringify({
            success: true,
            processed: processedCount,
            total_tasks_checked: tasks?.length || 0,
            details: results,
            stats: stats?.[0] || null
        }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        // ✅ SECURITY: Logar internamente, nunca expor stack trace ao cliente
        console.error('Error in notify-due-tasks function:', err)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
