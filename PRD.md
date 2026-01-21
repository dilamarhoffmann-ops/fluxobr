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

### 4.1. Gestão de Tarefas (Kanban & Agenda)
*   **Criação e Edição:** Tarefas com título, descrição, prioridade, data de entrega, responsável, empresa vinculada e checklists.
*   **Checklists Mandatórios:** O status da tarefa evolui automaticamente:
    *   **Pendente:** Estado inicial.
    *   **Em Andamento:** Ativado ao marcar o primeiro item do checklist.
    *   **Em Revisão:** Ativado automaticamente ao concluir 100% do checklist.
*   **Agendamento Comercial Restrito:** Regras rígidas de prazo (08:00 às 18:00 em intervalos de 15 min).
*   **Observações do Responsável:** Campo de texto editável pelo Responsável, Criador e Gestores/Admins.
*   **Status Workflow:** Pendente, Em Andamento, Em Revisão, Concluído (gestor/admin), Arquivado (gestor/admin).
*   **Interface:** Exibição do nome do responsável diretamente nos cards para fácil identificação.

### 4.2. Gestão de Equipes e Empresas
*   **Portfólio por Squad:** Empresas vinculadas a times específicos.
*   **Controle de Acesso (RBAC):**
    *   **Admin:** Visão global.
    *   **Gestor:** Focado no seu Squad e empresas vinculadas.
    *   **Colaborador:** Focado em suas tarefas e tarefas replicadas da equipe.

### 4.3. Sistema de Notificações Inteligente
*   **E-mails via Resend:** Disparos automáticos para tarefas vencidas.
*   **Escalonamento:** Re-notificação configurada para 3, 7, 14 e 30 dias de atraso.
*   **Auditoria:** Registro detalhado de disparos na tabela `notification_logs`.

### 4.4. Administração e Segurança
*   **Reset de Senha:** Redefinição administrativa para "123mudar" com troca obrigatória.
*   **Whitelist:** Controle de registro por e-mail autorizado.

## 5. Arquitetura Técnica
*   **Frontend:** React 19, Vite, TypeScript, Tailwind CSS.
*   **Backend:** Supabase (Auth, DB, Storage, Edge Functions).
*   **Integrações:** Resend (E-mail), Gemini AI (Inteligência de base de dados).

## 6. Fluxos Relevantes
1.  **Validação de Prazo:** Sistema bloqueia agendamentos fora do horário comercial.
2.  **Automação de Status:** Checklist conduz o ciclo de vida da tarefa.
3.  **Gestão de Feedback:** Campo de observações centraliza a comunicação sobre a tarefa.

## 7. Roadmap Futuro
*   **Relatórios em PDF:** Dashboards de exportação.
*   **Notificações Webhook:** Integração com apps de chat.
*   **Dashboard Executivo:** Comparativo de produtividade entre times.

