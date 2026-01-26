# Análise: Processo de Envio de Email sobre Status de Tarefas ao Alcançar o Prazo

**Data da Análise:** 21/01/2026  
**Sistema:** FluxoBR Dashboard  
**Funcionalidade:** Notificação automática de tarefas vencidas por email

---

## 📋 Resumo Executivo

O sistema possui uma **Edge Function do Supabase** (`notify-due-tasks`) responsável por enviar emails automáticos aos gestores quando tarefas alcançam ou ultrapassam o prazo de vencimento. A função utiliza o serviço **Resend** para envio de emails e está configurada para processar tarefas que ainda não foram notificadas.

---

## 🏗️ Arquitetura Atual

### 1. **Edge Function: `notify-due-tasks`**

**Localização:** `supabase/functions/notify-due-tasks/index.ts`

#### Fluxo de Execução:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Trigger (Manual ou Cron Job)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Buscar tarefas vencidas não notificadas                 │
│     - due_date <= hoje                                      │
│     - due_notification_sent = false                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Para cada tarefa:                                       │
│     a) Identificar o responsável (assignee)                 │
│     b) Buscar gestores/admins do mesmo squad/role           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Enviar email via Resend API para cada gestor            │
│     - Informações: título, responsável, prazo, status       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Marcar tarefa como notificada                           │
│     - due_notification_sent = true                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detalhamento Técnico

### **Consulta SQL Executada:**

```sql
SELECT 
  id,
  title,
  status,
  due_date,
  assignee_id,
  assignee:profiles!assignee_id (
    full_name,
    role
  )
FROM tasks
WHERE due_notification_sent = false
  AND due_date <= NOW()
```

### **Critérios de Seleção de Gestores:**

```sql
SELECT email, full_name
FROM profiles
WHERE role = [role_do_responsavel]
  AND access_level IN ('gestor', 'admin')
```

### **Estrutura do Email Enviado:**

- **Remetente:** `FluxoBR <onboarding@resend.dev>`
- **Destinatário:** Email do gestor
- **Assunto:** `🔔 Alerta de Prazo: Tarefa "[título_da_tarefa]"`
- **Conteúdo HTML:**
  - Nome do gestor
  - Título da tarefa
  - Nome e role do responsável
  - Data de vencimento (formato pt-BR)
  - Status atual (com código de cores)
  - Call-to-action para acessar o dashboard

---

## ⚙️ Configuração Necessária

### **Variáveis de Ambiente (Supabase Edge Function):**

| Variável | Descrição | Status |
|----------|-----------|--------|
| `RESEND_API_KEY` | Chave de API do Resend | ⚠️ Requer configuração |
| `SUPABASE_URL` | URL do projeto Supabase | ✅ Auto-configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (ignora RLS) | ✅ Auto-configurado |

### **Campo no Banco de Dados:**

A tabela `tasks` deve ter o campo:
- `due_notification_sent` (boolean, default: false)

**⚠️ ATENÇÃO:** Este campo **NÃO** foi encontrado na definição de tipos TypeScript (`types.ts`), o que pode indicar:
1. O campo existe no banco mas não está tipado no frontend
2. A funcionalidade pode não estar completamente integrada

---

## 🚨 Problemas e Limitações Identificados

### **1. Falta de Agendamento Automático (Cron Job)**

**Problema:** Não há evidências de um cron job configurado no Supabase para executar a função automaticamente.

**Impacto:** A função precisa ser acionada manualmente ou via webhook externo.

**Solução Recomendada:**
```sql
-- Configurar no Supabase Dashboard > Database > Cron Jobs
SELECT cron.schedule(
  'notify-due-tasks-daily',
  '0 9 * * *', -- Todos os dias às 9h
  $$
  SELECT net.http_post(
    url := 'https://[seu-projeto].supabase.co/functions/v1/notify-due-tasks',
    headers := '{"Authorization": "Bearer [ANON_KEY]"}'::jsonb
  );
  $$
);
```

### **2. Campo `due_notification_sent` Não Tipado**

**Problema:** O campo não está presente na interface `Task` em `types.ts`.

**Impacto:** 
- Possível inconsistência entre frontend e backend
- Dificuldade de rastreamento do status de notificação na UI

**Solução Recomendada:**
```typescript
export interface Task {
  // ... campos existentes
  dueNotificationSent?: boolean; // Adicionar este campo
}
```

### **3. Notificação Única (Sem Reenvio)**

**Problema:** Uma vez marcada como `due_notification_sent = true`, a tarefa não será notificada novamente, mesmo que continue vencida.

**Impacto:** Gestores não recebem lembretes recorrentes para tarefas críticas atrasadas.

**Solução Recomendada:**
- Implementar sistema de escalação (enviar novamente após X dias)
- Adicionar campo `last_notification_date` para controlar frequência
- Criar níveis de urgência (1 dia, 3 dias, 7 dias de atraso)

### **4. Ausência de Notificação ao Responsável**

**Problema:** Apenas gestores recebem emails. O responsável pela tarefa não é notificado.

**Impacto:** O colaborador pode não saber que sua tarefa está vencida.

**Solução Recomendada:**
- Adicionar envio de email também para o `assignee`
- Diferenciar o conteúdo do email (gestor vs. colaborador)

### **5. Dependência de Email no Perfil**

**Problema:** A query busca `email` da tabela `profiles`, mas o campo é opcional (`email?: string`).

**Impacto:** Se um gestor não tiver email cadastrado, ele não será notificado.

**Solução Recomendada:**
- Tornar o campo `email` obrigatório para gestores/admins
- Adicionar validação na criação de perfis
- Implementar fallback (notificação in-app)

### **6. Falta de Logs e Auditoria**

**Problema:** Não há registro persistente de quais emails foram enviados e quando.

**Impacto:** Dificulta troubleshooting e auditoria.

**Solução Recomendada:**
- Criar tabela `notification_logs`:
  ```sql
  CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id),
    recipient_email TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    status TEXT, -- 'success', 'failed'
    error_message TEXT
  );
  ```

### **7. Modo de Teste Manual**

**Funcionalidade Existente:** A função aceita parâmetro `?email=teste@exemplo.com` para envio de teste.

**Problema:** Não há documentação sobre como usar esta funcionalidade.

**Como Testar:**
```bash
curl "https://[seu-projeto].supabase.co/functions/v1/notify-due-tasks?email=seu-email@exemplo.com" \
  -H "Authorization: Bearer [ANON_KEY]"
```

---

## 📊 Métricas e Monitoramento

### **Dados Retornados pela Função:**

```json
{
  "success": true,
  "processed": 5,
  "details": [
    {
      "taskId": "uuid-da-tarefa",
      "managerEmail": "gestor@exemplo.com",
      "emailResult": { /* resposta do Resend */ }
    }
  ]
}
```

### **Métricas Recomendadas para Monitorar:**

1. **Taxa de Envio:**
   - Quantos emails foram enviados por dia
   - Quantas tarefas foram processadas

2. **Taxa de Falha:**
   - Emails que falharam ao enviar
   - Motivos de falha (API key inválida, email inválido, etc.)

3. **Tempo de Resposta:**
   - Quanto tempo a função leva para processar todas as tarefas

4. **Cobertura:**
   - % de tarefas vencidas que foram notificadas
   - % de gestores que receberam notificações

---

## 🎯 Recomendações de Melhoria

### **Prioridade Alta:**

1. ✅ **Configurar Cron Job no Supabase**
   - Executar diariamente às 9h (horário comercial)
   - Considerar execução adicional às 14h para tarefas do dia

2. ✅ **Adicionar campo `dueNotificationSent` aos tipos TypeScript**
   - Garantir consistência entre frontend e backend

3. ✅ **Implementar logs de auditoria**
   - Rastreabilidade completa de notificações

### **Prioridade Média:**

4. 🔄 **Notificar também o responsável pela tarefa**
   - Email diferenciado para colaboradores

5. 🔄 **Sistema de escalação para tarefas muito atrasadas**
   - Reenviar notificação após 3 dias, 7 dias, etc.

6. 🔄 **Validação de emails obrigatórios**
   - Garantir que gestores tenham email cadastrado

### **Prioridade Baixa:**

7. 💡 **Dashboard de notificações**
   - Visualizar histórico de emails enviados
   - Estatísticas de entregas

8. 💡 **Integração com outros canais**
   - Slack, Discord, WhatsApp
   - Notificações push no navegador

9. 💡 **Personalização de horários**
   - Permitir que cada gestor configure quando quer receber emails

---

## 🔐 Segurança e Compliance

### **Pontos Positivos:**

✅ Uso de Service Role Key para ignorar RLS (necessário para função automática)  
✅ Emails enviados apenas para gestores autorizados  
✅ Dados sensíveis não expostos no email (apenas título e status)

### **Pontos de Atenção:**

⚠️ **RESEND_API_KEY em variável de ambiente** - Garantir que está configurada corretamente  
⚠️ **Domínio de email** - Usar domínio verificado em produção (não `onboarding@resend.dev`)  
⚠️ **LGPD/GDPR** - Garantir que usuários consentiram receber emails automáticos

---

## 📝 Checklist de Implementação

Para garantir que o sistema de notificações está funcionando corretamente:

- [ ] Verificar se o campo `due_notification_sent` existe na tabela `tasks`
- [ ] Configurar `RESEND_API_KEY` nas variáveis de ambiente do Supabase
- [ ] Configurar domínio verificado no Resend
- [ ] Criar cron job no Supabase para execução automática
- [ ] Adicionar campo `dueNotificationSent` em `types.ts`
- [ ] Testar envio manual com parâmetro `?email=`
- [ ] Validar que gestores têm emails cadastrados
- [ ] Criar tabela de logs de notificações
- [ ] Documentar processo de troubleshooting
- [ ] Configurar alertas para falhas de envio

---

## 🔗 Recursos Relacionados

- **Edge Function:** `supabase/functions/notify-due-tasks/index.ts`
- **Tipos:** `types.ts` (Task interface)
- **PRD:** `PRD.md` (Seção 4.1 - Lembretes)
- **Resend Docs:** https://resend.com/docs
- **Supabase Cron:** https://supabase.com/docs/guides/database/extensions/pg_cron

---

## 📞 Próximos Passos

1. **Validar com stakeholders:**
   - Confirmar horários ideais para envio
   - Definir frequência de reenvio para tarefas atrasadas
   - Validar conteúdo do email

2. **Implementar melhorias críticas:**
   - Configurar cron job
   - Adicionar logs de auditoria
   - Validar campo no banco de dados

3. **Testar em ambiente de staging:**
   - Criar tarefas de teste com prazos vencidos
   - Validar recebimento de emails
   - Verificar marcação de `due_notification_sent`

4. **Deploy em produção:**
   - Configurar domínio verificado
   - Monitorar primeiros envios
   - Coletar feedback dos gestores

---

**Documento gerado por:** Antigravity AI  
**Última atualização:** 21/01/2026 07:49 BRT
