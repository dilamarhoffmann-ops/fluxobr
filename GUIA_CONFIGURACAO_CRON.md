# Guia de Configuração: Cron Job para Notificações de Tarefas Vencidas

**Última atualização:** 21/01/2026  
**Objetivo:** Configurar execução automática da Edge Function `notify-due-tasks`

---

## 📋 Pré-requisitos

Antes de configurar o cron job, certifique-se de que:

- [ ] A migration `20260121_add_notification_logs.sql` foi aplicada ao banco de dados
- [ ] A Edge Function `notify-due-tasks` está deployada no Supabase
- [ ] A variável de ambiente `RESEND_API_KEY` está configurada no Supabase
- [ ] Você tem acesso de administrador ao projeto Supabase

---

## 🔧 Opção 1: Cron Job via pg_cron (Recomendado)

### Passo 1: Habilitar a extensão pg_cron

1. Acesse o **Supabase Dashboard**
2. Navegue até **Database** → **Extensions**
3. Procure por `pg_cron` e clique em **Enable**

### Passo 2: Criar o Cron Job

Execute o seguinte SQL no **SQL Editor** do Supabase:

```sql
-- Criar cron job para executar diariamente às 9h (horário do servidor UTC)
-- Ajuste o horário conforme necessário (ex: '0 12 * * *' para 9h BRT = 12h UTC)
SELECT cron.schedule(
    'notify-due-tasks-daily',           -- Nome do job
    '0 12 * * *',                        -- Cron expression (12h UTC = 9h BRT)
    $$
    SELECT
      net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-due-tasks',
          headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer YOUR_ANON_KEY'
          )
      ) as request_id;
    $$
);
```

**⚠️ IMPORTANTE:** Substitua:
- `YOUR_PROJECT_REF` pelo ID do seu projeto Supabase
- `YOUR_ANON_KEY` pela chave anônima do projeto (encontrada em Settings → API)

### Passo 3: Verificar o Cron Job

```sql
-- Listar todos os cron jobs ativos
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Passo 4: Ajustar Horário (Opcional)

Se precisar alterar o horário de execução:

```sql
-- Remover o job existente
SELECT cron.unschedule('notify-due-tasks-daily');

-- Criar novamente com novo horário
-- Exemplos de horários (UTC):
-- '0 12 * * *'  -> 9h BRT (12h UTC)
-- '0 15 * * *'  -> 12h BRT (15h UTC)
-- '0 9,15 * * *' -> 6h e 12h BRT (9h e 15h UTC)
```

---

## 🔧 Opção 2: Cron Job Externo (Alternativa)

Se preferir não usar pg_cron, você pode usar um serviço externo como **Cron-job.org**, **EasyCron**, ou **GitHub Actions**.

### Exemplo com GitHub Actions

Crie o arquivo `.github/workflows/notify-tasks.yml`:

```yaml
name: Notify Due Tasks

on:
  schedule:
    # Executa diariamente às 9h BRT (12h UTC)
    - cron: '0 12 * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            "https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-due-tasks" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

**Configuração:**
1. Adicione o secret `SUPABASE_ANON_KEY` no GitHub (Settings → Secrets)
2. Faça commit do arquivo no repositório
3. O workflow será executado automaticamente

---

## 🧪 Testar a Configuração

### Teste Manual

Execute no SQL Editor:

```sql
-- Simular execução do cron job
SELECT
  net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-due-tasks',
      headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_ANON_KEY'
      )
  ) as request_id;
```

### Teste com Email Específico

```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-due-tasks?email=seu-email@exemplo.com" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📊 Monitoramento

### Ver Logs da Edge Function

1. Acesse **Edge Functions** → **notify-due-tasks** → **Logs**
2. Verifique se há erros ou avisos

### Consultar Estatísticas de Notificações

```sql
-- Ver estatísticas dos últimos 30 dias
SELECT * FROM get_notification_stats(30);

-- Ver últimas notificações enviadas
SELECT 
    nl.sent_at,
    nl.recipient_email,
    nl.recipient_type,
    nl.status,
    t.title as task_title,
    nl.error_message
FROM notification_logs nl
JOIN tasks t ON t.id = nl.task_id
ORDER BY nl.sent_at DESC
LIMIT 20;

-- Ver taxa de sucesso por dia
SELECT 
    DATE(sent_at) as date,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'success') as successful,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
    ) as success_rate
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

---

## 🔍 Troubleshooting

### Problema: Cron job não está executando

**Solução:**
1. Verifique se a extensão `pg_cron` está habilitada
2. Confirme que o job está na lista: `SELECT * FROM cron.job;`
3. Verifique logs de erro: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

### Problema: Emails não estão sendo enviados

**Solução:**
1. Verifique se `RESEND_API_KEY` está configurada corretamente
2. Consulte os logs da Edge Function
3. Verifique a tabela `notification_logs` para ver erros específicos:
   ```sql
   SELECT * FROM notification_logs 
   WHERE status = 'failed' 
   ORDER BY sent_at DESC 
   LIMIT 10;
   ```

### Problema: Tarefas não estão sendo detectadas

**Solução:**
1. Verifique se há tarefas vencidas:
   ```sql
   SELECT id, title, due_date, status, due_notification_sent
   FROM tasks
   WHERE due_date < NOW()
   AND status NOT IN ('Concluído', 'Arquivado')
   ORDER BY due_date;
   ```
2. Verifique se a função `should_renotify_task` está retornando `true`:
   ```sql
   SELECT id, title, should_renotify_task(id) as should_notify
   FROM tasks
   WHERE due_date < NOW();
   ```

### Problema: Muitos emails duplicados

**Solução:**
- A função agora usa lógica de escalação que previne duplicatas
- Verifique se `last_notification_date` está sendo atualizado corretamente
- Ajuste a lógica em `should_renotify_task` se necessário

---

## ⚙️ Configurações Avançadas

### Múltiplas Execuções por Dia

```sql
-- Executar às 9h e 15h (12h e 18h UTC)
SELECT cron.schedule(
    'notify-due-tasks-morning',
    '0 12 * * *',
    $$ [mesmo código da função] $$
);

SELECT cron.schedule(
    'notify-due-tasks-afternoon',
    '0 18 * * *',
    $$ [mesmo código da função] $$
);
```

### Notificações Apenas em Dias Úteis

```sql
-- Executar apenas de segunda a sexta
SELECT cron.schedule(
    'notify-due-tasks-weekdays',
    '0 12 * * 1-5',  -- 1-5 = Segunda a Sexta
    $$ [mesmo código da função] $$
);
```

### Alertas de Falha

Configure um webhook para receber alertas quando o cron job falhar:

```sql
-- Criar função para notificar falhas
CREATE OR REPLACE FUNCTION notify_cron_failure()
RETURNS void AS $$
BEGIN
    -- Enviar notificação via webhook, Slack, etc.
    PERFORM net.http_post(
        url := 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
        body := jsonb_build_object(
            'text', 'Cron job notify-due-tasks falhou!'
        )
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 Checklist de Implementação

- [ ] Extensão `pg_cron` habilitada
- [ ] Cron job criado e agendado
- [ ] Teste manual executado com sucesso
- [ ] Logs da Edge Function verificados
- [ ] Estatísticas de notificações consultadas
- [ ] Monitoramento configurado
- [ ] Documentação compartilhada com a equipe
- [ ] Horários ajustados conforme fuso horário local

---

## 🔗 Recursos Adicionais

- **Documentação pg_cron:** https://github.com/citusdata/pg_cron
- **Cron Expression Generator:** https://crontab.guru/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Resend API Docs:** https://resend.com/docs/api-reference/emails/send-email

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Consulte os logs da Edge Function
2. Verifique a tabela `notification_logs`
3. Execute as queries de troubleshooting acima
4. Revise a documentação do Supabase

---

**Documento criado por:** Antigravity AI  
**Última atualização:** 21/01/2026 07:52 BRT
