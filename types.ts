
export enum TaskStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  REVIEW = 'Em Revisão',
  DONE = 'Concluído',
  BLOCKED = 'Bloqueado',
}

export enum TaskPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica',
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string; // Represents the Team
}

export interface Company {
  id: string;
  name: string;
  logo: string; // URL or color string
  team: string; // Changed from industry to team
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  companyId: string; // Link task to a company
  dueDate: string; // ISO Date string
  createdAt: string;
  startedAt?: string; // ISO Date string
  completedAt?: string; // ISO Date string
  faqId?: string; // Reference to FAQItem ID
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'startedAt' | 'completedAt' | 'companyId'>;

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  url?: string; // External link for documentation
}
