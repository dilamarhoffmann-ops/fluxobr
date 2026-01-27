# Product Requirements Document (PRD) - FluxoBR Dashboard

## 1. Visão Geral do Produto
O **FluxoBR Dashboard** é um ecossistema inteligente de gestão de demandas e produtividade operacional. Projetado para squads de alta performance, o sistema combina a agilidade do método Kanban com o rigor de checklists mandatórios e um histórico auditável (Linha do Tempo), garantindo que nenhuma informação se perca entre as transferências de responsabilidade.

## 2. Objetivos Estratégicos
*   **Transparência Radical:** Visibilidade total de quem fez o quê, quando e onde (Linha do Tempo).
*   **Operação à Prova de Falhas:** Bloqueios de segurança para prazos retroativos e horários não comerciais.
*   **Descentralização Assistida:** Permitir que colaboradores devolvam ou transfiram demandas com rastreabilidade total.
*   **Base de Conhecimento Ativa:** FAQ integrado para reduzir gargalos de dúvida operacional.
*   **Auditoria de Performance:** Relatórios executivos e métricas de tempo real.

## 3. Arquitetura de Perfis e Permissões (RBAC)
O sistema opera em três níveis de acesso distintos:
1.  **Administrador:** Acesso total, gerenciamento de usuários, whitelist de e-mails, reset de senhas e gestão global de empresas/equipes.
2.  **Gestor:** Focado na supervisão do seu Squad. Pode validar conclusões, arquivar tarefas, gerenciar templates de processos e visualizar métricas da equipe.
3.  **Colaborador:** Focado na execução. Visualiza o Kanban da equipe, executa checklists, anexa evidências e pode devolver demandas se necessário.

## 4. Funcionalidades Detalhadas

### 4.1. Gestão de Demandas (Core)
*   **Identidade Única:** Cada tarefa recebe um ID alfanumérico curto (Ex: #A1B2) visível em todas as telas para facilitar a comunicação.
*   **Kanban Dinâmico:** Organização visual em 5 estágios: Pendente, Em Andamento, Em Revisão, Concluído e Arquivado.
*   **Checklist Inteligente:**
    *   O status muda para **"Em Andamento"** ao marcar o primeiro item.
    *   O status muda para **"Em Revisão"** ao completar 100% dos itens.
*   **Anexos e Evidências:** Suporte a Imagens e PDFs com visualizador integrado (modal) para conferência rápida de documentos.
*   **Observações do Responsável:** Campo de notas rico para registro de nuances da execução, editável pelos envolvidos.

### 4.2. Fluxo de Transferência e Devolução (Premium)
*   **Transferência para Squad:** Movimentação de demandas entre diferentes áreas da empresa.
*   **Delegação Interna:** Gestores podem atribuir tarefas ou partes delas a membros específicos.
*   **Devolução Inteligente:** Colaboradores podem retornar uma tarefa para qualquer pessoa que tenha participado do fluxo (Criador ou Transferidores anteriores).
*   **Split de Demanda (Divisão):** Possibilidade de transferir apenas itens selecionados de um checklist, gerando uma nova tarefa vinculada para o receptor enquanto mantém o restante com o emissor.

### 4.3. Linha do Tempo (Audit Trail)
Histórico cronológico visual no detalhe de cada tarefa, registrando com precisão:
*   **Criação (Verde):** Quem abriu e para quem foi designada.
*   **Transferência (Âmbar):** Movimentações entre equipes.
*   **Delegação (Índigo):** Atribuições diretas de gestão.
*   **Devolução (Rosa):** Retorno da demanda por impossibilidade ou erro.
*   **Finalização (Ciano):** Registro de quem deu o "check" final.
*   *Nota: Todos os eventos registram Data, Hora e, se aplicável, o novo prazo definido.*

### 4.4. Agenda e Planejamento
*   **Calendário Mensal:** Visão macro das entregas do mês com indicadores de status por cor.
*   **Visualização Diária:** Detalhamento de compromissos ao clicar em uma data específica.
*   **Tarefas Recorrentes:** Automação de tarefas diárias, semanais ou mensais (Ex: Fechamentos de caixa, backups).
*   **Lembretes:** Sistema de notificações internas para alertas pontuais com hora marcada.

### 4.5. Inteligência e Relatórios
*   **Dashboard de Métricas:** Contador de tarefas Pendentes, Em Andamento, Atrasadas e Concluídas com gráficos de tendência.
*   **Exportação Premium:** Geração de relatórios em **PDF** (layout executivo) e **CSV** (para análise em Excel/BI).
*   **FAQ (Base de Conhecimento):** Gestão de perguntas frequentes categorizadas para auxiliar na padronização de processos.

## 5. Regras de Negócio e Segurança
*   **Trava Temporal:** O sistema impede a criação ou transferência de tarefas para datas passadas ou horários inferiores ao atual.
*   **Horário Comercial:** Agendamentos restritos ao intervalo das 08h às 18h, com intervalos de 15 minutos.
*   **Autenticação Segura:** Login via Supabase Auth com política de troca de senha obrigatória no primeiro acesso (reset administrativo).
*   **Whitelist de Acesso:** Apenas e-mails previamente autorizados na base podem criar conta.
*   **Isolamento de Dados:** Usuários só visualizam dados pertinentes ao seu Squad ou demandas em que foram citados.

## 6. Stack Tecnológica
*   **Frontend:** React 19 (Hooks Context API), Vite, TypeScript.
*   **Estilização:** Tailwind CSS (Modern Glassmorphism Design).
*   **Backend as a Service:** Supabase (PostgreSQL, Auth, Storage).
*   **Comunicação:** Resend API (Notificações por E-mail).
*   **AI:** Google Gemini SDK (Geração de Insights).

---
*Última atualização: 26 de Janeiro de 2026*
