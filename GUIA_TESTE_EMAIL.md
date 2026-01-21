# Guia Rápido: Testar Envio de Email

**Data:** 21/01/2026  
**Objetivo:** Testar a Edge Function de notificações por email

---

## 🎯 Opções de Teste

Você tem **3 opções** para testar o envio de email:

### **Opção 1: Via Interface do Dashboard (Recomendado)** ⭐

1. Adicione o componente de teste ao App.tsx
2. Acesse a aplicação no navegador
3. Use a interface visual para testar

### **Opção 2: Via Script Node.js**

1. Configure as credenciais no arquivo `test-email.js`
2. Execute: `node test-email.js`

### **Opção 3: Via cURL (Terminal)**

1. Execute comandos cURL diretamente no terminal

---

## 📋 Pré-requisitos

Antes de testar, você precisa:

- [ ] **Edge Function deployada** no Supabase
- [ ] **RESEND_API_KEY** configurada no Supabase
- [ ] **Migration aplicada** ao banco de dados
- [ ] Suas **credenciais do Supabase** (URL e ANON_KEY)

### Como obter as credenciais:

1. Acesse o **Supabase Dashboard**
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

---

## 🖥️ Opção 1: Teste via Interface (Recomendado)

### Passo 1: Adicionar componente ao App

Abra `App.tsx` e adicione o import:

```typescript
import { EmailTest } from './components/EmailTest';
```

### Passo 2: Adicionar ao render

Adicione dentro do componente Settings ou em uma nova aba:

```typescript
{/* Adicionar em algum lugar visível, por exemplo, na aba Settings */}
<EmailTest 
  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
  supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
/>
```

### Passo 3: Testar

1. Acesse a aplicação
2. Navegue até onde adicionou o componente
3. Digite seu email
4. Clique em "Enviar Email de Teste"
5. Verifique sua caixa de entrada (e spam)

---

## 💻 Opção 2: Teste via Script Node.js

### Passo 1: Configurar credenciais

Edite o arquivo `test-email.js` e substitua:

```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
const TEST_EMAIL = 'seu-email@exemplo.com';
```

### Passo 2: Executar

```bash
node test-email.js
```

### Passo 3: Verificar resultado

O script irá:
1. Enviar um email de teste
2. Processar tarefas vencidas (se houver)
3. Mostrar estatísticas

---

## 🔧 Opção 3: Teste via cURL

### Teste Simples (Email Específico)

```bash
curl "https://SEU_PROJETO.supabase.co/functions/v1/notify-due-tasks?email=seu-email@exemplo.com" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Teste Completo (Tarefas Vencidas)

```bash
curl -X POST "https://SEU_PROJETO.supabase.co/functions/v1/notify-due-tasks" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Substitua:**
- `SEU_PROJETO` pelo ID do seu projeto
- `SUA_ANON_KEY` pela chave anônima
- `seu-email@exemplo.com` pelo email de teste

---

## 🔍 Verificar Resultados

### 1. Email Recebido

Verifique:
- ✉️ Caixa de entrada
- 📧 Pasta de spam
- 🗑️ Lixeira (às vezes emails de teste vão para lá)

### 2. Logs da Edge Function

1. Acesse **Supabase Dashboard**
2. Vá em **Edge Functions** → **notify-due-tasks**
3. Clique em **Logs**
4. Verifique se há erros

### 3. Tabela de Logs

Execute no SQL Editor:

```sql
-- Ver últimas notificações
SELECT 
  sent_at,
  recipient_email,
  status,
  error_message
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 10;
```

---

## ❌ Troubleshooting

### Problema: "Edge Function não encontrada"

**Solução:**
```bash
# Deploy da função
supabase functions deploy notify-due-tasks

# OU via Supabase Dashboard
# Edge Functions → Upload/Deploy
```

### Problema: "RESEND_API_KEY não configurada"

**Solução:**
1. Acesse **Supabase Dashboard**
2. **Settings** → **Edge Functions**
3. Adicione variável: `RESEND_API_KEY` = `sua_chave_resend`

### Problema: "Email não chegou"

**Possíveis causas:**
1. Email foi para spam
2. RESEND_API_KEY inválida
3. Domínio não verificado no Resend
4. Limite de envio atingido (plano gratuito: 100/dia)

**Verificar:**
```sql
-- Ver se o email foi registrado como enviado
SELECT * FROM notification_logs 
WHERE recipient_email = 'seu-email@exemplo.com'
ORDER BY sent_at DESC;
```

### Problema: "Migration não aplicada"

**Solução:**
```bash
# Via CLI
supabase db push

# OU via SQL Editor
# Copiar e executar: supabase/migrations/20260121_add_notification_logs.sql
```

### Problema: "Erro 401 Unauthorized"

**Solução:**
- Verifique se a ANON_KEY está correta
- Certifique-se de que a função está deployada
- Verifique as RLS policies

---

## 📊 Exemplo de Resposta Bem-Sucedida

### Email de Teste:
```json
{
  "success": true,
  "result": {
    "id": "abc123-def456",
    "from": "FluxoBR <onboarding@resend.dev>",
    "to": "seu-email@exemplo.com",
    "created_at": "2026-01-21T10:58:45.000Z"
  }
}
```

### Notificação Completa:
```json
{
  "success": true,
  "processed": 3,
  "total_tasks_checked": 5,
  "details": [
    {
      "taskId": "task-123",
      "recipient": "colaborador@empresa.com",
      "type": "assignee",
      "result": { "success": true, "id": "email-id-1" }
    },
    {
      "taskId": "task-123",
      "recipient": "gestor@empresa.com",
      "type": "manager",
      "result": { "success": true, "id": "email-id-2" }
    }
  ],
  "stats": {
    "total_sent": 45,
    "total_failed": 2,
    "success_rate": 95.56,
    "tasks_notified": 23,
    "unique_recipients": 12
  }
}
```

---

## ✅ Checklist de Teste

- [ ] Credenciais do Supabase obtidas
- [ ] Edge Function deployada
- [ ] RESEND_API_KEY configurada
- [ ] Migration aplicada
- [ ] Teste simples executado
- [ ] Email recebido
- [ ] Logs verificados
- [ ] Teste completo executado (opcional)
- [ ] Estatísticas consultadas (opcional)

---

## 🎯 Próximos Passos

Após testar com sucesso:

1. ✅ Configurar cron job (ver `GUIA_CONFIGURACAO_CRON.md`)
2. ✅ Trocar domínio de email para domínio verificado
3. ✅ Criar tarefas de teste com prazos vencidos
4. ✅ Monitorar logs regularmente
5. ✅ Ajustar horários de notificação conforme necessário

---

**Criado por:** Antigravity AI  
**Data:** 21/01/2026 07:58 BRT
