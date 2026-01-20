
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
    // Configuração do cliente Supabase com Service Role para ignorar RLS
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const url = new URL(req.url)
    const testEmail = url.searchParams.get('email')

    if (testEmail) {
        console.log(`Disparando e-mail de teste para: ${testEmail}`)
        const emailContent = {
            from: 'AgilePulse <onboarding@resend.dev>',
            to: testEmail,
            subject: '🧪 Teste de Integração AgilePulse',
            html: `<h1>Conexão Bem-Sucedida!</h1><p>Este é um e-mail de teste disparado manualmente para validar a integração entre o Supabase e o Resend.</p>`,
        }

        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(emailContent),
        })

        const result = await emailRes.json()
        return new Response(JSON.stringify({ success: true, result }), {
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        // 1. Buscar tarefas que venceram ou vencem hoje e ainda não foram notificadas
        // Usamos a data atual do banco de dados para consistência
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        status,
        due_date,
        assignee_id,
        assignee:profiles!assignee_id (
          full_name,
          role
        )
      `)
            .eq('due_notification_sent', false)
            .lte('due_date', new Date().toISOString())

        if (tasksError) throw tasksError

        console.log(`Encontradas ${tasks?.length || 0} tarefas para notificar.`)

        const results = []

        for (const task of tasks || []) {
            const assignee = task.assignee as any
            if (!assignee) continue

            // 2. Buscar gestores/admins do mesmo squad/role
            const { data: managers, error: managersError } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('role', assignee.role)
                .in('access_level', ['gestor', 'admin'])

            if (managersError) {
                console.error(`Erro ao buscar gestores para task ${task.id}:`, managersError)
                continue
            }

            if (!managers || managers.length === 0) {
                console.log(`Nenhum gestor encontrado para o time ${assignee.role}`)
                continue
            }

            // 3. Enviar e-mail para cada gestor
            for (const manager of managers) {
                const emailContent = {
                    from: 'AgilePulse <onboarding@resend.dev>', // Usar domínio verificado em produção
                    to: manager.email,
                    subject: `🔔 Alerta de Prazo: Tarefa "${task.title}"`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
              <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Monitoramento de Prazos AgilePulse</h2>
              <p>Olá <strong>${manager.full_name}</strong>,</p>
              <p>A seguinte tarefa atingiu a data de vencimento definida:</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Tarefa:</strong> ${task.title}</p>
                <p style="margin: 5px 0;"><strong>Responsável:</strong> ${assignee.full_name} (${assignee.role})</p>
                <p style="margin: 5px 0;"><strong>Prazo:</strong> ${new Date(task.due_date).toLocaleDateString('pt-BR')}</p>
                <p style="margin: 5px 0;"><strong>Status Atual:</strong> <span style="color: ${task.status === 'Concluído' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${task.status}</span></p>
              </div>

              <p>Por favor, acesse o dashboard para revisar a entrega ou ajustar o cronograma, se necessário.</p>
              
              <div style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
                Este é um e-mail automático enviado pelo AgilePulse Dashboard.
              </div>
            </div>
          `,
                }

                if (RESEND_API_KEY) {
                    const emailRes = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${RESEND_API_KEY}`,
                        },
                        body: JSON.stringify(emailContent),
                    })

                    const emailResult = await emailRes.json()
                    results.push({ taskId: task.id, managerEmail: manager.email, emailResult })
                } else {
                    console.log("RESEND_API_KEY não configurada. Logando email:", emailContent)
                }
            }

            // 4. Marcar como notificada para não repetir no próximo ciclo
            await supabase
                .from('tasks')
                .update({ due_notification_sent: true })
                .eq('id', task.id)
        }

        return new Response(JSON.stringify({ success: true, processed: tasks?.length, details: results }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
