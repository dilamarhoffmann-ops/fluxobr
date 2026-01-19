
import { Collaborator, Task, TaskPriority, TaskStatus, Company, FAQItem } from './types';

export const ADMIN_PASSWORD = 'admin';

export const COLLABORATORS: Collaborator[] = [
  { id: 'admin', name: 'Administrador do Sistema', role: 'Super User', avatar: 'https://picsum.photos/100/100?random=100', isManager: true },
  { id: 'c1', name: 'Ana Silva', role: 'Frontend Dev', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'c2', name: 'Carlos Souza', role: 'Backend Dev', avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'c3', name: 'Mariana Lima', role: 'QA Engineer', avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'c4', name: 'Pedro Santos', role: 'Product Owner', avatar: 'https://picsum.photos/100/100?random=4' },
  { id: 'c5', name: 'Julia Costa', role: 'UX Designer', avatar: 'https://picsum.photos/100/100?random=5' },
];

export const INITIAL_TEAMS: string[] = [
  'Frontend Dev',
  'Backend Dev',
  'Full Stack',
  'Mobile Dev',
  'QA Engineer',
  'UX Designer',
  'Product Owner',
  'Scrum Master',
  'DevOps'
];

export const COMPANIES: Company[] = [
  { id: 'comp1', name: 'TechFin Solutions', logo: 'bg-blue-600', team: ['Frontend Dev'] },
  { id: 'comp2', name: 'EcoRetail', logo: 'bg-green-600', team: ['UX Designer'] },
  { id: 'comp3', name: 'HealthPlus', logo: 'bg-red-500', team: ['Backend Dev'] },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: "Como priorizar tarefas atrasadas?",
    answer: "Utilize a matriz de Eisenhower para categorizar tarefas. Foque primeiro em tarefas urgentes e importantes.",
    url: "https://asana.com/resources/eisenhower-matrix"
  },
  {
    id: 'faq2',
    question: "Como adicionar um novo colaborador?",
    answer: "Vá para a aba 'Configurações', verifique se o 'Modo Gestor' está ativo. Na seção 'Gerenciar Membros', preencha o nome e selecione a equipe.",
    url: ""
  },
  {
    id: 'faq3',
    question: "Documentação de API (Swagger)",
    answer: "Link direto para a documentação técnica da API para uso em tarefas de Backend.",
    url: "https://swagger.io/tools/swagger-ui/"
  },
  {
    id: 'faq4',
    question: "Guia de Estilos (Design System)",
    answer: "Referência visual para tarefas de Frontend e UX.",
    url: "https://material.io/design"
  },
  {
    id: 'faq5',
    question: "Protocolos OAuth 2.0",
    answer: "Documentação oficial do Google sobre implementação de OAuth.",
    url: "https://developers.google.com/identity/protocols/oauth2"
  },
  {
    id: 'faq6',
    question: "Testes com Jest",
    answer: "Guia de referência para testes unitários e de integração.",
    url: "https://jestjs.io/docs/api"
  }
];

const generateDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const generateTimestamp = (daysOffset: number, hoursOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
  return date.toISOString();
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Implementar Autenticação OAuth',
    description: 'Configurar login com Google e GitHub.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    assigneeId: 'c2',
    companyId: 'comp1',
    dueDate: generateDate(-2),
    createdAt: generateDate(-10),
    startedAt: generateTimestamp(-9),
    completedAt: generateTimestamp(-3),
    faqId: 'faq5',
  },
  {
    id: 't2',
    title: 'Refatorar Componente de Modal',
    description: 'Melhorar acessibilidade e animações.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assigneeId: 'c1',
    companyId: 'comp1',
    dueDate: generateDate(2),
    createdAt: generateDate(-5),
    startedAt: generateTimestamp(-4),
  },
  {
    id: 't3',
    title: 'Desenhar Novos Ícones',
    description: 'Conjunto de ícones para o dashboard.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.LOW,
    assigneeId: 'c5',
    companyId: 'comp2',
    dueDate: generateDate(1),
    createdAt: generateDate(-3),
    startedAt: generateTimestamp(-2),
    faqId: 'faq4'
  },
  {
    id: 't4',
    title: 'Testes de Integração API',
    description: 'Cobrir rotas críticas de pagamento.',
    status: TaskStatus.ARCHIVED,
    priority: TaskPriority.CRITICAL,
    assigneeId: 'c3',
    companyId: 'comp1',
    dueDate: generateDate(0),
    createdAt: generateDate(-4),
    startedAt: generateTimestamp(-3),
    faqId: 'faq6',
  },
  {
    id: 't5',
    title: 'Definir Backlog Q3',
    description: 'Reunião com stakeholders para priorização.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    assigneeId: 'c4',
    companyId: 'comp3',
    dueDate: generateDate(5),
    createdAt: generateDate(-1),
  },
  {
    id: 't6',
    title: 'Otimização de Queries SQL',
    description: 'Reduzir tempo de resposta do endpoint /stats.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assigneeId: 'c2',
    companyId: 'comp2',
    dueDate: generateDate(3),
    createdAt: generateDate(-2),
    startedAt: generateTimestamp(-2),
  },
  {
    id: 't7',
    title: 'Ajuste de Cores Dark Mode',
    description: 'Revisar paleta de cores para contraste.',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    assigneeId: 'c5',
    companyId: 'comp2',
    dueDate: generateDate(-1),
    createdAt: generateDate(-8),
    startedAt: generateTimestamp(-7),
    completedAt: generateTimestamp(-1, -2),
  },
  {
    id: 't8',
    title: 'Setup CI/CD Pipeline',
    description: 'Automatizar deploy para ambiente de staging.',
    status: TaskStatus.ARCHIVED,
    priority: TaskPriority.HIGH,
    assigneeId: 'c2',
    companyId: 'comp3',
    dueDate: generateDate(-3),
    createdAt: generateDate(-12),
    startedAt: generateTimestamp(-10),
  },
  {
    id: 't9',
    title: 'Atualizar Documentação da API',
    description: 'Incluir novos endpoints na documentação Swagger.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    assigneeId: 'c1',
    companyId: 'comp1',
    dueDate: generateDate(10),
    createdAt: generateDate(0),
    faqId: 'faq3'
  },
  {
    id: 't10',
    title: 'Testes de Regressão Mobile',
    description: 'Verificar compatibilidade com iOS 17.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assigneeId: 'c3',
    companyId: 'comp3',
    dueDate: generateDate(4),
    createdAt: generateDate(-2),
    startedAt: generateTimestamp(-2, 5),
  },
];
