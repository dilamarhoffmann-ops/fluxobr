# Product Requirements Document (PRD) - AgilePulse Dashboard

## 1. Visão Geral do Produto
O **AgilePulse Dashboard** é uma plataforma de gestão de tarefas e colaboração de equipes focada em agilidade e organização. O sistema permite que gestores e colaboradores acompanhem o fluxo de trabalho, gerenciem prazos, organizem checklists e mantenham uma base de conhecimento centralizada (FAQ). A aplicação é construída com tecnologias modernas de web (React, Vite, Supabase) e oferece uma interface responsiva e segura.

## 2. Objetivos do Produto
*   Centralizar a gestão de tarefas operacionais e estratégicas.
*   Melhorar a visibilidade do progresso das atividades por equipe e empresa.
*   Facilitar a integração de novos membros através de FAQs e processos padronizados.
*   Fornecer insights baseados em dados para tomada de decisão.
*   Garantir a segurança dos dados através de controle de acesso granular.

## 3. Público Alvo
*   **Administradores:** Gerenciam todo o sistema, usuários, empresas e configurações globais.
*   **Gestores:** Supervisionam equipes, validam tarefas (revisão), criam templates e gerenciam o fluxo de trabalho.
*   **Colaboradores:** Executam tarefas, atualizam status e colaboram nas atividades diárias.

## 4. Funcionalidades Principais

### 4.1. Gestão de Tarefas (Kanban & Lista)
*   **Criação e Edição:** Tarefas com título, descrição, prioridade, data de entrega, responsável, empresa vinculada e checklists.
*   **Checklists:** Sub-tarefas dentro de um card principal. O status da tarefa muda automaticamente conforme o progresso do checklist (e.g., pendente -> em progresso -> revisão).
*   **Status Workflow:** Pendente, Em Andamento, Em Revisão (somente gestores/admin), Concluído, Bloqueado.
*   **Lembretes:** Configuração de lembretes com notificações no navegador.
*   **Anexos:** Suporte a links e uploads de arquivos.
*   **Recorrência:** Configuração de frequência de repetição para tarefas rotineiras.

### 4.2. Gestão de Equipes e Empresas
*   **Empresas:** Cadastro de empresas clientes com vinculação a squads/times específicos.
*   **Times (Squads):** Organização de colaboradores em times.
*   **Restrições de Visualização:** Colaboradores veem apenas empresas e tarefas pertinentes ao seu time (exceto Admins).

### 4.3. Base de Conhecimento (FAQ)
*   **FAQ Interativo:** Perguntas e respostas categorizadas.
*   **Anexos:** Upload de manuais e documentos PDF vinculados aos itens do FAQ.
*   **Links Externos:** Referências para documentação externa.

### 4.4. Templates de Tarefas
*   **Padronização:** Criação de modelos de tarefas com atividades pré-definidas para processos recorrentes.
*   **Instanciação Rápida:** Geração de tarefas reais a partir de templates com um clique.

### 4.5. Painel de Controle (Dashboard)
*   **Métricas:** Resumo de tarefas totais, concluídas, bloqueadas e atrasadas.
*   **Gráficos:** Visualização de desempenho e distribuição de tarefas (via Recharts).
*   **Agenda:** Visualização de prazos em formato de calendário.

### 4.6. Administração e Segurança
*   **Autenticação:** Login seguro via Supabase Auth.
*   **Gestão de Usuários:** Cadastro de membros, definição de papéis (Admin, Gestor, Colaborador) e níveis de acesso.
*   **Emails Autorizados:** Controle de quem pode se registrar na plataforma (whitelist de emails).
*   **Tema:** Suporte a modo claro e escuro (Dark Mode).

## 5. Arquitetura Técnica

### 5.1. Tech Stack
*   **Frontend:** React 19, Vite, TypeScript.
*   **Estilização:** Tailwind CSS (Responsivo e Dark Mode), Lucide React (Ícones).
*   **Estado e Efeitos:** React Hooks, Context API.
*   **Componentes:** Framer Motion (Animações), Recharts (Gráficos).
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
*   **IA (Experimental):** Integração com Google Gemini (@google/genai) para insights inteligentes.

### 5.2. Banco de Dados (Schema Simplificado)
*   `profiles`: Dados dos usuários e suas roles.
*   `tasks`: Tabela principal de tarefas.
*   `companies`: Empresas clientes.
*   `teams`: Times/Squads.
*   `faqs`: Itens da base de conhecimento.
*   `authorized_emails`: Whitelist para controle de acesso.
*   `task_templates` & `template_tasks` & `template_activities`: Estrutura para modelos.

### 5.3. Segurança (Row Level Security - RLS)
*   Políticas rigorosas no banco de dados para garantir que usuários acessem apenas dados permitidos pelo seu nível de acesso e time.

## 6. Fluxos de Aprovação
1.  **Execução:** Colaborador marca itens do checklist.
2.  **Automação:** Tarefa move para "Em Andamento" ao iniciar checklist.
3.  **Conclusão:** Ao completar todos os itens, tarefa move para "Em Revisão".
4.  **Validação:** Gestor revisa e move para "Concluído" ou devolve.

## 7. Roadmap Futuro (Sugestões)
*   **Notificações em Tempo Real:** WebSockets para atualizações instantâneas sem refresh.
*   **Gamificação:** Pontuação por tarefas concluídas.
*   **Integração com Slack/Discord:** Bots para notificar equipes.
*   **Relatórios Avançados:** Exportação de métricas em PDF/Excel.
