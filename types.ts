
export enum TaskStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  REVIEW = 'Em Revisão',
  DONE = 'Concluído',
  ARCHIVED = 'Arquivado',
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
  email?: string;
  avatar: string;
  role: string; // Represents the Team
  isManager?: boolean;
  accessLevel?: string; // 'colaborador', 'gestor', 'admin'
  mustChangePassword?: boolean;
  allowed?: boolean;
  area?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string; // URL or color string
  team: string[]; // Changed from string to string[] to support multiple teams
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
  reminder?: string; // ISO string for reminder date/time
  checklist?: {
    title: string;
    completed: boolean;
    completedBy?: string;
    completedByName?: string;
  }[];
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
  creatorId?: string;
  attachmentUrl?: string; // URL for attached document (e.g. PDF)
  isReplicated?: boolean;
  notes?: string;
  dueNotificationSent?: boolean; // Track if due date notification email was sent
  transferHistory?: {
    type?: 'criacao' | 'transferencia' | 'delegacao' | 'devolucao' | 'finalizacao';
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    date: string;
    deadline?: string;
    projectName?: string;
    notes?: string;
  }[];
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'startedAt' | 'completedAt' | 'companyId'>;

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  archivedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  completionRate: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  url?: string; // External link for documentation
  pdfUrl?: string; // URL for attached PDF/Document
  imageUrl?: string; // URL for attached Image
  creatorId?: string;
}

export interface TemplateActivity {
  id: string;
  templateTaskId: string;
  title: string;
}

export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  activities: TemplateActivity[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  tasks: TemplateTask[];
}
export interface ActivityLog {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  details?: any;
}
