# 📋 Guia de Importação de Tarefas Squad

Este guia explica como importar tarefas de um arquivo DOCX para o sistema AgilePulse como um Template de Tarefas.

## 📁 Arquivos Criados

### Scripts PowerShell
- `extract_to_json.ps1` - Extrai conteúdo do DOCX para JSON
- `process_tasks.ps1` - Processa linhas e identifica tarefas/subtarefas

### Scripts TypeScript/Node.js
- `import_tasks_cli.ts` - Importação via linha de comando (requer .env.local)

### Componentes React
- `components/ImportTasksFromJSON.tsx` - Componente React para importação

### Interface Web Standalone
- `import_tasks.html` - Página HTML standalone (RECOMENDADO)

### Arquivos de Dados
- `tarefas_extraidas.json` - Conteúdo bruto extraído do DOCX
- `tarefas_processadas.json` - Tarefas estruturadas (usado para importação)

## 🚀 Processo Completo

### Passo 1: Extrair Conteúdo do DOCX

```powershell
powershell -ExecutionPolicy Bypass -File .\extract_to_json.ps1
```

**Resultado:** Cria `tarefas_extraidas.json` com todas as linhas do documento.

### Passo 2: Processar Tarefas

```powershell
powershell -ExecutionPolicy Bypass -File .\process_tasks.ps1
```

**Resultado:** Cria `tarefas_processadas.json` com estrutura de tarefas e subtarefas.

### Passo 3: Importar para o Banco de Dados

Você tem **3 opções**:

#### Opção A: Interface Web Standalone (RECOMENDADO) ✅

1. Abra o arquivo `import_tasks.html` no navegador
2. Configure as credenciais do Supabase:
   - **Supabase URL**: Encontre em Supabase Dashboard → Settings → API → Project URL
   - **Supabase Anon Key**: Encontre em Supabase Dashboard → Settings → API → Project API keys → anon/public
3. Selecione o arquivo `tarefas_processadas.json`
4. Clique em "Importar Tarefas"
5. Aguarde a conclusão

**Vantagens:**
- ✅ Não requer configuração de ambiente
- ✅ Interface visual com progresso
- ✅ Funciona em qualquer navegador
- ✅ Não precisa de autenticação de usuário

#### Opção B: Componente React (Integrado ao Sistema)

1. Adicione o componente em uma página do sistema:

```tsx
import { ImportTasksFromJSON } from './components/ImportTasksFromJSON';

// Em algum lugar do seu código
<ImportTasksFromJSON 
  userId={currentUser?.id}
  onComplete={(templateId) => {
    console.log('Template criado:', templateId);
    // Redirecionar ou atualizar lista
  }}
/>
```

2. Acesse a página e faça upload do arquivo `tarefas_processadas.json`

**Vantagens:**
- ✅ Integrado ao sistema
- ✅ Usa autenticação do usuário logado
- ✅ Pode redirecionar automaticamente após importação

#### Opção C: Linha de Comando (Avançado)

1. Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

2. Execute o script:

```bash
npx tsx import_tasks_cli.ts
```

Ou com ID de usuário específico:

```bash
npx tsx import_tasks_cli.ts "uuid-do-usuario"
```

**Vantagens:**
- ✅ Automação completa
- ✅ Pode ser integrado em pipelines CI/CD
- ✅ Útil para importações em massa

## 📊 Estrutura do Arquivo Processado

O arquivo `tarefas_processadas.json` tem a seguinte estrutura:

```json
{
  "processedAt": "2026-02-05T10:48:32",
  "totalTasks": 50,
  "tasks": [
    {
      "number": 1,
      "title": "AGENDAR BOLETOS DE COMBUSTIVEIS",
      "subtasks": [
        "Entrar em portais diariamente",
        "Verificar quantidade de boletos",
        "Confirmar previsão de pagamento"
      ]
    },
    {
      "number": 2,
      "title": "IMPORTAR RETORNO",
      "subtasks": [
        "Baixar arquivo",
        "Importar para sistema"
      ]
    }
  ]
}
```

## 🎯 Resultado Final

Após a importação bem-sucedida, você terá:

1. **Template de Tarefas** criado no banco de dados:
   - Nome: "Tarefas Squad"
   - Descrição: Informações sobre a importação
   - ID: Gerado automaticamente

2. **Tarefas do Template** (template_tasks):
   - Uma para cada tarefa principal do documento
   - Título e descrição configurados
   - Prioridade padrão: "Média"

3. **Atividades do Template** (template_activities):
   - Uma para cada subtarefa
   - Vinculadas à tarefa pai correspondente

## 📍 Acessando o Template

Após a importação:

1. Acesse o sistema AgilePulse
2. Vá para **Configurações** (⚙️)
3. Clique em **Modelos**
4. Encontre "Tarefas Squad"
5. Use o template para criar novas tarefas

## 🔧 Troubleshooting

### Erro: "Arquivo não encontrado"
- Certifique-se de que `tarefas_processadas.json` está na raiz do projeto
- Execute os passos 1 e 2 novamente

### Erro: "Credenciais inválidas"
- Verifique se a URL e a chave do Supabase estão corretas
- Certifique-se de usar a **anon key**, não a service key

### Erro: "Permissão negada"
- Verifique as políticas RLS (Row Level Security) no Supabase
- Certifique-se de que a tabela `task_templates` permite inserções

### Tarefas não aparecem estruturadas
- O script `process_tasks.ps1` usa heurísticas para identificar tarefas
- Tarefas principais geralmente são em MAIÚSCULAS ou começam com números
- Você pode editar manualmente o `tarefas_processadas.json` se necessário

## 📝 Notas Importantes

1. **Arquivo Original**: O arquivo original é `taredas squad.docx` (note o erro de digitação no nome)
2. **Encoding**: Todos os scripts usam UTF-8 para evitar problemas com caracteres especiais
3. **Backup**: Sempre faça backup antes de importações em massa
4. **Duplicação**: O script NÃO verifica duplicatas. Executar múltiplas vezes criará múltiplos templates

## 🎉 Próximos Passos

Após importar as tarefas:

1. Revise o template criado
2. Ajuste prioridades se necessário
3. Adicione descrições mais detalhadas
4. Use o template para criar tarefas reais no sistema

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do Supabase Dashboard
3. Revise a estrutura do arquivo JSON
4. Consulte a documentação do Supabase sobre RLS

---

**Criado em:** 2026-02-05  
**Versão:** 1.0  
**Autor:** Sistema AgilePulse
