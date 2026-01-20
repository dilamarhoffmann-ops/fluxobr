import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_TASKS, COLLABORATORS, COMPANIES, INITIAL_TEAMS, INITIAL_FAQS } from './constants';
import { Task, TaskInput, TaskStatus, Company, Collaborator, FAQItem } from './types';
import { LayoutDashboard, CheckSquare, Settings as SettingsIcon, Bell, Menu, Building2, HelpCircle, LogOut, Calendar } from 'lucide-react';
import { MetricsRow } from './components/MetricsCards';
import { DashboardCharts } from './components/DashboardCharts';
import { TaskManagement } from './components/TaskManagement';
import { Settings } from './components/Settings';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CompanyList } from './components/CompanyList';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FAQManager } from './components/FAQManager';
import { SupabaseLogin } from './components/SupabaseLogin';
import { SmartInsights } from './components/SmartInsights';
import { MenuVertical } from './components/ui/menu-vertical';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './hooks/useAuth';
import { db, supabase } from './lib/supabase';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { AgendaView } from './components/AgendaView';
import { ReminderNotificationModal } from './components/ReminderNotificationModal';
import { ForceChangePasswordModal } from './components/ForceChangePasswordModal';
import { HelpModal } from './components/HelpModal';
import { Avatar } from './components/ui/Avatar';

enum Tab {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  COMPANIES = 'companies',
  SETTINGS = 'settings',
  FAQ = 'faq',
  AGENDA = 'agenda',
}

const App: React.FC = () => {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  // States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [authorizedEmails, setAuthorizedEmails] = useState<any[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Current User Profile (from DB)
  const [currentUserProfile, setCurrentUserProfile] = useState<Collaborator | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [createModalMode, setCreateModalMode] = useState<'nova' | 'modelo' | 'lembrete'>('nova');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Delete Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'task' | 'company' | 'collaborator' | 'team' | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  // Notifications State
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Task Details Modal State
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Mapping Helpers
  const mapTaskFromDB = (data: any): Task => ({
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as TaskStatus,
    priority: data.priority,
    assigneeId: data.assignee_id,
    companyId: data.company_id || '', // Garantir string vazia se for null
    dueDate: data.due_date,
    createdAt: data.created_at,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    faqId: data.faq_id,
    reminder: data.reminder,
    checklist: data.checklist || [],
    repeatFrequency: data.repeat_frequency || 'none',
    creatorId: data.creator_id,
    attachmentUrl: data.attachment_url,
  });

  const mapCompanyFromDB = (data: any): Company => {
    let teams: string[] = [];

    const processValue = (val: any) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach(item => processValue(item));
      } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            processValue(parsed);
          } catch {
            teams.push(trimmed);
          }
        } else if (trimmed) {
          teams.push(trimmed);
        }
      }
    };

    processValue(data.team);

    return {
      id: data.id,
      name: data.name,
      logo: data.logo || 'bg-blue-600',
      team: Array.from(new Set(teams)),
    };
  };

  const mapCollaboratorFromDB = (data: any): Collaborator => ({
    id: data.id,
    name: data.full_name || 'Usuário',
    email: data.email,
    avatar: data.avatar_url || `https://picsum.photos/100/100?seed=${data.id}`,
    role: data.role || 'Membro',
    isManager: data.is_manager,
    accessLevel: data.access_level || 'colaborador',
    mustChangePassword: data.must_change_password
  });

  const mapFAQFromDB = (data: any): FAQItem => ({
    id: data.id,
    question: data.question,
    answer: data.answer,
    url: data.url,
    pdfUrl: data.pdf_url,
    creatorId: data.created_by
  });

  // Load Initial Data
  useEffect(() => {
    if (!authUser) return;

    const loadData = async () => {
      setDataLoading(true);
      try {
        // Load Profile
        const { data: profileData } = await db.getById('profiles', authUser.id);
        if (profileData) {
          const profile = mapCollaboratorFromDB(profileData);
          setCurrentUserProfile(profile);

          // Admin Mode stays false by default as initialized in state.
          // Users must enable it manually in Settings.
        }

        // Load Companies
        const { data: companiesData } = await db.getAll('companies');
        if (companiesData) setCompanies(companiesData.map(mapCompanyFromDB));

        // Load Collaborators
        const { data: collabsData } = await db.getAll('profiles');
        if (collabsData) setCollaborators(collabsData.map(mapCollaboratorFromDB));

        // Load Teams
        const { data: teamsData } = await db.getAll('teams');
        if (teamsData) {
          setTeams(teamsData.map((t: any) => t.name));
        }

        // Load Authorized Emails
        const { data: authEmailsData } = await db.getAll('authorized_emails');
        if (authEmailsData) setAuthorizedEmails(authEmailsData);

        // Load FAQs
        const { data: faqsData } = await db.getAll('faqs');
        if (faqsData) setFaqs(faqsData.map(mapFAQFromDB));

        // Load Task Templates (Recursive approach simplified for now)
        const { data: templatesData } = await db.getAll('task_templates');
        if (templatesData) {
          const fullTemplates = await Promise.all(templatesData.map(async (tmpl: any) => {
            const { data: tasksData } = await db.from('template_tasks').select('*').eq('template_id', tmpl.id);
            const tasksWithActivities = await Promise.all((tasksData || []).map(async (tk: any) => {
              const { data: actsData } = await db.from('template_activities').select('*').eq('template_task_id', tk.id);
              return { ...tk, activities: actsData || [] };
            }));
            return { ...tmpl, tasks: tasksWithActivities };
          }));
          setTaskTemplates(fullTemplates);
        }

        // Load Tasks
        const { data: tasksData } = await db.getAll('tasks');
        if (tasksData) setTasks(tasksData.map(mapTaskFromDB));

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  // Reminder Checker Logic
  useEffect(() => {
    if (!authUser) return;

    const checkReminders = () => {
      const now = new Date();

      tasks.forEach(task => {
        if (task.reminder && task.status !== TaskStatus.DONE) {
          const reminderDate = new Date(task.reminder);
          const diffInMinutes = (now.getTime() - reminderDate.getTime()) / (1000 * 60);

          if (diffInMinutes >= 0 && diffInMinutes < 2) {
            const alreadyNotified = notifications.some(n => n.id === task.id);
            if (!alreadyNotified) {
              setNotifications(prev => [task, ...prev]);
              setHasNewNotification(true);
              if (Notification.permission === 'granted') {
                new Notification('Lembrete de Tarefa', {
                  body: `Está na hora de: ${task.title}`,
                  icon: '/favicon.ico'
                });
              }
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks, notifications, authUser]);

  const filteredCompanies = useMemo(() => {
    if (!currentUserProfile) return [];

    // ADMIN: Vê todas as empresas
    if (currentUserProfile.accessLevel === 'admin') return companies;

    // GESTOR ou COLABORADOR: Veem apenas empresas onde sua EQUIPE está vinculada
    return companies.filter(c => {
      if (!Array.isArray(c.team)) return false;
      const userRoleLower = currentUserProfile.role.trim().toLowerCase();
      return c.team.some(teamName => teamName.trim().toLowerCase() === userRoleLower);
    });
  }, [companies, currentUserProfile]);

  const filteredTasks = useMemo(() => {
    if (!currentUserProfile) return [];

    const isGlobalAdmin = currentUserProfile.accessLevel === 'admin';
    const userTeam = currentUserProfile.role.trim().toLowerCase();

    // 1. ADMIN: Vê absolutamente tudo
    if (isGlobalAdmin) {
      return tasks;
    }

    // 2. Identificar quais empresas pertencem à equipe do usuário
    const allowedCompanyIds = new Set(filteredCompanies.map(c => c.id));

    // 3. Mapa de papéis/squads para busca rápida
    const colabRoleMap = new Map(collaborators.map(c => [c.id, c.role.trim().toLowerCase()]));

    return tasks.filter(t => {
      // Regra 0 (Prioridade Máxima): Se sou o CRIADOR ou RESPONSÁVEL, eu sempre vejo.
      if (t.assigneeId === currentUserProfile.id || t.creatorId === currentUserProfile.id) return true;

      // Se o usuário for um COLABORADOR comum, ele visualiza APENAS suas próprias tarefas (Regra 0).
      // A visibilidade de equipe (Regras 3 e 4) aplica-se apenas a GESTORES ou ADMINS.
      const isManagerOrAdmin = currentUserProfile.accessLevel === 'gestor' || currentUserProfile.accessLevel === 'admin';
      if (!isManagerOrAdmin) return false;

      // Regra 3: Atribuído a alguém da minha equipe (mesmo squad) - VISÍVEL APENAS PARA GESTORES
      if (t.assigneeId) {
        const assigneeRole = colabRoleMap.get(t.assigneeId);
        if (assigneeRole === userTeam) return true;
      }

      // Regra 4: Criado por alguém da minha equipe (mesmo squad) - VISÍVEL APENAS PARA GESTORES
      if (t.creatorId) {
        const creatorRole = colabRoleMap.get(t.creatorId);
        if (creatorRole === userTeam) return true;
      }

      // Regra 5: É um lembrete (não depende de empresa, exibição baseada em equipe já coberta acima, mas reforçando)
      // Regra 5: É um lembrete (não depende de empresa, exibição baseada em equipe já coberta acima, mas reforçando)
      if (t.reminder) {
        // Removida visibilidade global de Gestor para evitar vazamento entre Squads
        return false;
      }

      return false;
    });
  }, [tasks, currentUserProfile, filteredCompanies, collaborators]);

  const filteredCollaborators = useMemo(() => {
    if (!currentUserProfile) return [];

    // Admins veem todos
    if (currentUserProfile.accessLevel === 'admin') return collaborators;

    // Gestores e Colaboradores veem apenas membros do MESMO TIME/SQUAD
    const userTeam = currentUserProfile.role.trim().toLowerCase();
    return collaborators.filter(c => c.role.trim().toLowerCase() === userTeam);
  }, [collaborators, currentUserProfile]);

  const metrics = useMemo(() => {
    const targetTasks = filteredTasks;
    const totalTasks = targetTasks.length;
    const completedTasks = targetTasks.filter(t => t.status === TaskStatus.DONE).length;
    const archivedTasks = targetTasks.filter(t => t.status === TaskStatus.ARCHIVED).length;
    const overdueTasks = targetTasks.filter((t: Task) => t.status !== TaskStatus.DONE && new Date(t.dueDate) < new Date()).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { totalTasks, completedTasks, archivedTasks, overdueTasks, completionRate };
  }, [filteredTasks]);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Define se o usuário tem permissões de gestor baseado no perfil
    const isManagerProfile = currentUserProfile?.accessLevel === 'admin' || currentUserProfile?.accessLevel === 'gestor';

    // Somente gestores podem mover para CONCLUÍDO ou ARQUIVADO
    if (!isManagerProfile && (newStatus === TaskStatus.DONE || newStatus === TaskStatus.ARCHIVED)) {
      alert('Apenas gestores podem marcar tarefas como "Arquivado" ou "Concluído".');
      return;
    }

    // Validação: só pode mover para IN_PROGRESS se tiver pelo menos uma atividade marcada
    if (newStatus === TaskStatus.IN_PROGRESS && task.checklist && task.checklist.length > 0) {
      const hasCompletedActivity = task.checklist.some(item => item.completed);
      if (!hasCompletedActivity) {
        alert('Você precisa marcar pelo menos uma atividade como concluída antes de mover para "Em Andamento".');
        return;
      }
    }

    const updates: any = { status: newStatus };
    const now = new Date().toISOString();

    if (newStatus === TaskStatus.IN_PROGRESS && !task.startedAt) {
      updates.started_at = now;
    }

    if (newStatus === TaskStatus.DONE) {
      updates.completed_at = now;
    } else if (task.status === TaskStatus.DONE) {
      updates.completed_at = null;
    }

    const { error } = await db.update('tasks', taskId, updates);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        status: newStatus,
        startedAt: updates.started_at || t.startedAt,
        completedAt: updates.completed_at === null ? undefined : (updates.completed_at || t.completedAt)
      } : t));
    }
  };

  const handleToggleChecklistItem = async (taskId: string, index: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;

    const newChecklist = [...task.checklist];
    newChecklist[index].completed = !newChecklist[index].completed;

    // Verifica quantos itens estão completos
    const completedCount = newChecklist.filter(item => item.completed).length;
    const totalCount = newChecklist.length;

    // Determina o novo status baseado no checklist
    let newStatus = task.status;
    const updates: any = { checklist: newChecklist };
    const now = new Date().toISOString();

    if (completedCount === totalCount && totalCount > 0) {
      // Todos concluídos -> REVIEW (para o gestor validar)
      newStatus = TaskStatus.REVIEW;
      updates.status = newStatus;
      updates.completed_at = null; // Só o gestor coloca a data de conclusão ao mudar para DONE
    } else if (completedCount === 0) {
      // Nenhum concluído -> PENDING
      newStatus = TaskStatus.PENDING;
      updates.status = newStatus;
      updates.started_at = null;
      updates.completed_at = null;
    } else {
      // Pelo menos um concluído (mas não todos) -> IN_PROGRESS
      newStatus = TaskStatus.IN_PROGRESS;
      updates.status = newStatus;
      updates.completed_at = null;
      if (!task.startedAt) updates.started_at = now;
    }

    const { error } = await db.update('tasks', taskId, updates);
    if (!error) {
      setTasks(prev => {
        const updatedTasks = prev.map(t => t.id === taskId ? {
          ...t,
          checklist: newChecklist,
          status: newStatus,
          startedAt: updates.started_at || t.startedAt,
          completedAt: updates.completed_at === null ? undefined : (updates.completed_at || t.completedAt)
        } : t);

        // Se a tarefa sendo visualizada é a mesma que foi atualizada, atualiza o modal
        if (viewingTask?.id === taskId) {
          const updatedTask = updatedTasks.find(t => t.id === taskId);
          if (updatedTask) setViewingTask(updatedTask);
        }

        return updatedTasks;
      });
    }
  };

  const handleOpenCreateModal = (date?: string, mode: 'nova' | 'modelo' | 'lembrete' = 'nova') => {
    setEditingTask(null);
    setPreselectedDate(date || null);
    setCreateModalMode(mode);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const handleSaveTask = async (taskInputOrArray: TaskInput | TaskInput[], targetCompanyIds: string[], replicateToAllMembers: boolean) => {
    const taskInputs = Array.isArray(taskInputOrArray) ? taskInputOrArray : [taskInputOrArray];

    if (editingTask && !Array.isArray(taskInputOrArray)) {
      const taskInput = taskInputOrArray;
      const dbTask = {
        title: taskInput.title,
        description: taskInput.description,
        status: taskInput.status,
        priority: taskInput.priority,
        due_date: taskInput.dueDate,
        assignee_id: taskInput.assigneeId,
        company_id: targetCompanyIds[0],
        faq_id: taskInput.faqId || null,
        reminder: taskInput.reminder || null,
        checklist: taskInput.checklist || [],
        repeat_frequency: taskInput.repeatFrequency || 'none',
        attachment_url: taskInput.attachmentUrl || null,
      };

      const { error } = await db.update('tasks', editingTask.id, dbTask);
      if (!error) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskInput, companyId: targetCompanyIds[0] } : t));
      }
    } else {
      const tasksToAdd: any[] = [];
      const now = new Date().toISOString();

      taskInputs.forEach(taskInput => {
        // Se targetCompanyIds estiver vazio (comum em lembretes), criamos pelo menos uma entrada com null
        const companiesToProcess = targetCompanyIds.length > 0 ? targetCompanyIds : [null];

        companiesToProcess.forEach((companyId) => {
          if (replicateToAllMembers) {
            filteredCollaborators.forEach((collab) => {
              tasksToAdd.push({
                title: taskInput.title,
                description: taskInput.description,
                status: taskInput.status,
                priority: taskInput.priority,
                due_date: taskInput.dueDate,
                assignee_id: collab.id,
                company_id: companyId,
                creator_id: authUser?.id,
                faq_id: taskInput.faqId || null,
                reminder: taskInput.reminder || null,
                checklist: taskInput.checklist || [],
                repeat_frequency: taskInput.repeatFrequency || 'none',
                started_at: taskInput.status === TaskStatus.IN_PROGRESS ? now : null,
                attachment_url: taskInput.attachmentUrl || null,
              });
            });
          } else {
            tasksToAdd.push({
              title: taskInput.title,
              description: taskInput.description,
              status: taskInput.status,
              priority: taskInput.priority,
              due_date: taskInput.dueDate,
              assignee_id: taskInput.assigneeId,
              company_id: companyId,
              creator_id: authUser?.id,
              faq_id: taskInput.faqId || null,
              attachment_url: taskInput.attachmentUrl || null,
              reminder: taskInput.reminder || null,
              checklist: taskInput.checklist || [],
              repeat_frequency: taskInput.repeatFrequency || 'none',
              started_at: taskInput.status === TaskStatus.IN_PROGRESS ? now : null
            });
          }
        });
      });

      const { data, error } = await db.insert('tasks', tasksToAdd);

      console.log('Resultado da inserção:', { data, error, tasksToAdd });

      if (error) {
        console.error('Erro ao criar tarefas:', error);
        alert('Erro ao criar tarefas. Verifique o console para detalhes.');
        return;
      }

      if (!error && data) {
        const newTasks = data.map(mapTaskFromDB);
        console.log('Tarefas criadas com sucesso:', newTasks);
        setTasks(prev => [...newTasks, ...prev]);
      }
    }
    setIsCreateModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => setDeleteConfirmation({ isOpen: true, type: 'task', id: taskId });
  const handleDeleteCompany = (id: string) => setDeleteConfirmation({ isOpen: true, type: 'company', id: id });
  const handleDeleteCollaborator = (id: string) => setDeleteConfirmation({ isOpen: true, type: 'collaborator', id: id });
  const handleDeleteTeam = (teamName: string) => setDeleteConfirmation({ isOpen: true, type: 'team', id: teamName });

  const executeDelete = async () => {
    const { type, id } = deleteConfirmation;
    if (!type || !id) return;

    let error = null;
    if (type === 'task') {
      ({ error } = await db.delete('tasks', id));
      if (!error) {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        console.error('Error deleting task:', error);
        alert('Erro ao excluir tarefa no banco de dados.');
      }
    } else if (type === 'company') {
      ({ error } = await db.delete('companies', id));
      if (!error) {
        setCompanies(prev => prev.filter(c => c.id !== id));
        setTasks(prev => prev.filter(t => t.companyId !== id));
      } else {
        console.error('Error deleting company:', error);
        alert('Erro ao excluir empresa no banco de dados.');
      }
    } else if (type === 'collaborator') {
      ({ error } = await db.delete('profiles', id));
      if (!error) {
        setCollaborators(prev => prev.filter(c => c.id !== id));
      } else {
        console.error('Error deleting collaborator:', error);
        alert('Erro ao remover colaborador no banco de dados.');
      }
    } else if (type === 'team') {
      const { error: teamError } = await db.from('teams').delete().eq('name', id);
      if (!teamError) {
        setTeams(prev => prev.filter(t => t !== id));
      } else {
        console.error('Error deleting team:', teamError);
        alert('Erro ao excluir equipe no banco de dados.');
      }
    }
    setDeleteConfirmation({ isOpen: false, type: null, id: null });
  };

  const handleAddCompany = async (name: string, teamsToAdd: string[]) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-500', 'bg-purple-600', 'bg-orange-500', 'bg-indigo-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await db.insert('companies', {
      name,
      team: JSON.stringify(teamsToAdd),
      logo: randomColor
    });
    if (!error && data) {
      setCompanies(prev => [...prev, mapCompanyFromDB(data[0])]);
    }
  };

  const handleUpdateCompany = async (id: string, name: string, teamsToUpdate: string[]) => {
    const { error } = await db.update('companies', id, {
      name,
      team: JSON.stringify(teamsToUpdate)
    });
    if (!error) {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, name, team: teamsToUpdate } : c));
    } else {
      console.error('Error updating company:', error);
      alert('Erro ao atualizar dados da empresa.');
    }
  };

  const handleAddCollaborator = async (name: string, role: string, isManager: boolean, email: string, accessLevel?: string) => {
    if (email) {
      await handleAddAuthorizedEmail(email, name, role, isManager, accessLevel);
    } else {
      alert("Para adicionar um novo membro, você deve informar o e-mail que ele usará para o acesso.");
    }
  };

  const handleEditCollaborator = async (id: string, name: string, role: string, isManager: boolean, accessLevel?: string) => {
    const { error } = await db.update('profiles', id, { full_name: name, role, is_manager: isManager, access_level: accessLevel });
    if (!error) {
      setCollaborators(prev => prev.map(c => c.id === id ? { ...c, name, role, isManager, accessLevel } : c));
    } else {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil no banco de dados.');
    }
  };

  const handleAddTeam = async (teamName: string) => {
    if (!teams.includes(teamName)) {
      const { data, error } = await db.insert('teams', { name: teamName });
      if (!error) {
        setTeams(prev => [...prev, teamName]);
      } else {
        console.error('Error adding team to DB:', error);
        alert(`Erro ao salvar equipe no banco: ${error.message}`);
      }
    }
  };

  const handleImportData = async (importedItems: any[]) => {
    let successCount = 0;
    let errorCount = 0;

    // Filter out duplicates in teams locally first for efficiency
    const existingTeams = new Set(teams);

    for (const item of importedItems) {
      const type = (item.tipo || item.type || '').toString().toLowerCase().trim();
      const name = (item.nome || item.name || '').toString().trim();

      if (!name) continue;

      try {
        if (type === 'equipe' || type === 'team') {
          if (!existingTeams.has(name)) {
            const { error } = await db.insert('teams', { name });
            if (!error) {
              setTeams(prev => [...prev, name]);
              existingTeams.add(name);
              successCount++;
            } else {
              console.error(`Error importing team ${name}:`, error);
              errorCount++;
            }
          }
        } else if (type === 'empresa' || type === 'company') {
          let teamsToLink: string[] = [];
          const squadsVal = item.equipes || item.teams || item.team || item.squads;

          if (Array.isArray(squadsVal)) {
            teamsToLink = squadsVal.map(s => s.toString().trim());
          } else if (typeof squadsVal === 'string' && squadsVal) {
            teamsToLink = squadsVal.split(',').map(s => s.trim()).filter(s => s);
          }

          const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-500', 'bg-purple-600', 'bg-orange-500', 'bg-indigo-600'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];

          const { data, error } = await db.insert('companies', {
            name,
            team: JSON.stringify(teamsToLink),
            logo: randomColor
          });

          if (!error && data) {
            setCompanies(prev => [...prev, mapCompanyFromDB(data[0])]);
            successCount++;
          } else {
            console.error(`Error importing company ${name}:`, error);
            errorCount++;
          }
        }
      } catch (err) {
        console.error('Unexpected error during import item processing:', err);
        errorCount++;
      }
    }

    alert(`Importação concluída!\nSucessos: ${successCount}\nErros: ${errorCount}`);
  };

  const handleAddAuthorizedEmail = async (email: string, fullName: string, role: string, isManager: boolean, accessLevel?: string) => {
    const { data, error } = await db.insert('authorized_emails', {
      email,
      full_name: fullName,
      role,
      is_manager: isManager,
      access_level: accessLevel || (isManager ? 'gestor' : 'colaborador'),
      created_by: authUser?.id
    });
    if (!error && data) {
      setAuthorizedEmails(prev => [...prev, data[0]]);
    }
  };

  const handleDeleteAuthorizedEmail = async (id: string) => {
    const { error } = await db.delete('authorized_emails', id);
    if (!error) {
      setAuthorizedEmails(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleAddFAQ = async (faq: Omit<FAQItem, 'id'>) => {
    const { data, error } = await db.insert('faqs', {
      question: faq.question,
      answer: faq.answer,
      url: faq.url,
      pdf_url: faq.pdfUrl,
      created_by: authUser?.id
    });
    if (!error && data) setFaqs(prev => [...prev, mapFAQFromDB(data[0])]);
  };

  const handleUpdateFAQ = async (id: string, updatedFaq: Omit<FAQItem, 'id'>) => {
    const { error } = await db.update('faqs', id, {
      question: updatedFaq.question,
      answer: updatedFaq.answer,
      url: updatedFaq.url,
      pdf_url: updatedFaq.pdfUrl
    });
    if (!error) setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...updatedFaq } : f));
  };

  const handleDeleteFAQ = async (id: string) => {
    const { error } = await db.delete('faqs', id);
    if (!error) setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleAddTaskTemplate = async (template: any) => {
    // 1. Insert Template
    const { data: tData, error: tErr } = await db.from('task_templates').insert({
      name: template.name,
      description: template.description,
      created_by: authUser?.id
    }).select();

    if (!tErr && tData) {
      const newTmpl = { ...tData[0], tasks: [] };
      setTaskTemplates(prev => [...prev, newTmpl]);
      return newTmpl.id;
    }
    return null;
  };

  const handleAddTemplateTask = async (templateId: string, task: any) => {
    const { data, error } = await db.from('template_tasks').insert({
      template_id: templateId,
      title: task.title,
      description: task.description,
      priority: task.priority
    }).select();

    if (!error && data) {
      setTaskTemplates(prev => prev.map(tmpl =>
        tmpl.id === templateId
          ? { ...tmpl, tasks: [...tmpl.tasks, { ...data[0], activities: [] }] }
          : tmpl
      ));
      return data[0].id;
    }
    return null;
  };

  const handleAddTemplateActivity = async (templateId: string, taskId: string, activityTitle: string) => {
    const { data, error } = await db.from('template_activities').insert({
      template_task_id: taskId,
      title: activityTitle
    }).select();

    if (!error && data) {
      setTaskTemplates(prev => prev.map(tmpl =>
        tmpl.id === templateId
          ? {
            ...tmpl,
            tasks: tmpl.tasks.map((tk: any) =>
              tk.id === taskId ? { ...tk, activities: [...tk.activities, data[0]] } : tk
            )
          }
          : tmpl
      ));
    }
  };

  const handleUpdateTaskTemplate = async (id: string, updates: any) => {
    const { error } = await db.from('task_templates').update(updates).eq('id', id);
    if (!error) {
      setTaskTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const handleUpdateTemplateTask = async (templateId: string, taskId: string, updates: any) => {
    const { error } = await db.from('template_tasks').update(updates).eq('id', taskId);
    if (!error) {
      setTaskTemplates(prev => prev.map(tmpl =>
        tmpl.id === templateId
          ? {
            ...tmpl,
            tasks: tmpl.tasks.map((tk: any) => tk.id === taskId ? { ...tk, ...updates } : tk)
          }
          : tmpl
      ));
    }
  };

  const handleDeleteTemplateActivity = async (templateId: string, taskId: string, activityId: string) => {
    const { error } = await db.from('template_activities').delete().eq('id', activityId);
    if (!error) {
      setTaskTemplates(prev => prev.map(tmpl =>
        tmpl.id === templateId
          ? {
            ...tmpl,
            tasks: tmpl.tasks.map((tk: any) =>
              tk.id === taskId
                ? { ...tk, activities: tk.activities.filter((act: any) => act.id !== activityId) }
                : tk
            )
          }
          : tmpl
      ));
    }
  };

  const handleDeleteTaskTemplate = async (id: string) => {
    const { error } = await db.from('task_templates').delete().eq('id', id);
    if (!error) {
      setTaskTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDeleteTemplateTask = async (templateId: string, taskId: string) => {
    const { error } = await db.from('template_tasks').delete().eq('id', taskId);
    if (!error) {
      setTaskTemplates(prev => prev.map(tmpl =>
        tmpl.id === templateId
          ? { ...tmpl, tasks: tmpl.tasks.filter((tk: any) => tk.id !== taskId) }
          : tmpl
      ));
    }
  };

  const handleUpdatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert('Erro ao atualizar senha: ' + error.message);
    } else {
      alert('Senha atualizada com sucesso!');
    }
  };

  const handleAdminResetPassword = async (userId: string) => {
    // Note: This requires a specific RPC function to be created in Supabase to work securely.
    // The RPC should also set must_change_password = true in profiles table.

    // Attempting to call the RPC function 'reset_user_password'
    const { error } = await supabase.rpc('reset_user_password', { target_user_id: userId });

    if (error) {
      console.error('Error resetting password:', error);
      // Fallback message if RPC is not set up
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        alert('Erro: A função de redefinição administrativa não está configurada no banco de dados.\n\nPor favor, execute o script SQL fornecido na documentação para criar a função "reset_user_password".');
      } else {
        alert(`Erro ao redefinir senha: ${error.message}`);
      }
    } else {
      // Optimistically update the local state if possible, though strict sync comes from DB
      alert('Senha do usuário redefinida com sucesso para "123mudar". O usuário será solicitado a alterar a senha no próximo login.');
    }
  };

  const handleForceUpdatePassword = async (password: string) => {
    if (!authUser) return;

    // 1. Update Password in Auth
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      alert('Erro ao atualizar senha: ' + authError.message);
      return;
    }

    // 2. Update 'must_change_password' flag in profiles
    const { error: profileError } = await db.update('profiles', authUser.id, { must_change_password: false });

    if (profileError) {
      console.error('Error updating profile flag:', profileError);
      // We continue anyway since password IS changed.
    }

    alert('Senha atualizada com sucesso!');
    // Update local profile state
    if (currentUserProfile) {
      setCurrentUserProfile({ ...currentUserProfile, mustChangePassword: false });
    }
  };

  const getDeleteModalInfo = () => {
    switch (deleteConfirmation.type) {
      case 'task': return { title: 'Excluir Tarefa', description: 'Tem certeza que deseja excluir esta tarefa?' };
      case 'company': return { title: 'Excluir Empresa', description: 'Isso excluirá a empresa e todas as suas tarefas.' };
      case 'collaborator': return { title: 'Remover Membro', description: 'Deseja remover este perfil?' };
      case 'team': return { title: 'Remover Equipe', description: 'A equipe será removida da lista de sugestões.' };
      default: return { title: '', description: '' };
    }
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  if (!authUser) return <SupabaseLogin />;

  const currentUser = currentUserProfile || { id: authUser.id, name: authUser.email || 'Usuário', role: 'Membro', avatar: '', isManager: false, accessLevel: 'colaborador' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans transition-colors">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-200`}>
        <div className="h-full flex flex-col">
          <div className="p-8 pb-4 flex flex-col items-center justify-center gap-2">
            <img src="/logo.png" alt="FluxoBR Logo" className="w-32 h-32 object-contain" />
          </div>
          <nav className="flex-1 px-2 py-6">
            <MenuVertical
              activeHref={activeTab}
              onItemClick={(href) => { setActiveTab(href as Tab); setIsMobileMenuOpen(false); }}
              color="#3b82f6"
              menuItems={[
                { label: 'Dashboard', href: Tab.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
                { label: 'Tarefas', href: Tab.TASKS, icon: <CheckSquare className="w-5 h-5" /> },
                { label: 'Agenda', href: Tab.AGENDA, icon: <Calendar className="w-5 h-5" /> },
                { label: 'Empresas', href: Tab.COMPANIES, icon: <Building2 className="w-5 h-5" /> },
                { label: 'FAQ', href: Tab.FAQ, icon: <HelpCircle className="w-5 h-5" /> },
                // Configurações acessíveis para Admin e Gestor
                ...(currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor' ? [{ label: 'Configurações', href: Tab.SETTINGS, icon: <SettingsIcon className="w-5 h-5" /> }] : []),
              ]}
            />
          </nav>
          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${currentUser.accessLevel === 'admin' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-400'}`}></div>
                <span className={`text-xs uppercase tracking-wider font-bold ${currentUser.accessLevel === 'admin' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {currentUser.accessLevel === 'admin' ? 'Administrador' : currentUser.accessLevel === 'gestor' ? 'Gestor' : 'Colaborador'}
                </span>
              </div>
              <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /> Sair</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-slate-900">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-500 dark:text-slate-400"><Menu className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden lg:block font-heading">
              {activeTab === Tab.DASHBOARD ? 'Visão Geral' : activeTab === Tab.TASKS ? 'Gerenciamento' : activeTab === Tab.COMPANIES ? 'Portfólio' : 'Configurações'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              title="Dúvidas"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
              <div className="hidden md:block">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto ${activeTab === Tab.TASKS || activeTab === Tab.AGENDA || activeTab === Tab.COMPANIES || activeTab === Tab.SETTINGS ? 'p-2 md:p-4' : 'p-4 md:p-8'}`}>
          <div className={`${activeTab === Tab.TASKS || activeTab === Tab.AGENDA || activeTab === Tab.COMPANIES || activeTab === Tab.SETTINGS ? 'max-w-[98%]' : 'max-w-7xl'} mx-auto min-h-full`}>
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 animate-pulse">Sincronizando com a nuvem...</p>
              </div>
            ) : (
              <>
                {activeTab === Tab.DASHBOARD && (
                  <div className="space-y-8 animate-fade-in">
                    <MetricsRow metrics={metrics} />
                    <DashboardCharts tasks={filteredTasks} collaborators={filteredCollaborators} companies={filteredCompanies} />
                  </div>
                )}
                {activeTab === Tab.TASKS && (
                  <TaskManagement
                    tasks={filteredTasks}
                    collaborators={filteredCollaborators}
                    companies={filteredCompanies}
                    faqs={faqs}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleOpenEditModal}
                    onViewTask={handleViewTask}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    isManager={currentUserProfile?.accessLevel === 'admin' || currentUserProfile?.accessLevel === 'gestor'}
                    onOpenCreateModal={handleOpenCreateModal}
                  />
                )}
                {activeTab === Tab.AGENDA && (
                  <AgendaView
                    tasks={filteredTasks}
                    collaborators={filteredCollaborators}
                    companies={filteredCompanies}
                    onViewTask={handleViewTask}
                    onAddClick={(date, mode) => handleOpenCreateModal(date, mode)}
                    onDeleteTask={handleDeleteTask}
                    isManager={currentUserProfile?.accessLevel === 'admin' || currentUserProfile?.accessLevel === 'gestor'}
                  />
                )}
                {activeTab === Tab.COMPANIES && (
                  <CompanyList
                    companies={filteredCompanies}
                    tasks={filteredTasks}
                    onAddCompany={handleAddCompany}
                    onUpdateCompany={(id, name, teams) => handleUpdateCompany(id, name, teams)}
                    onDeleteCompany={handleDeleteCompany}
                    collaborators={filteredCollaborators}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteTask={handleDeleteTask}
                    onViewTask={handleViewTask}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    onOpenCreateTask={handleOpenCreateModal}
                    isManager={currentUserProfile?.accessLevel === 'admin' || currentUserProfile?.accessLevel === 'gestor'}
                    isGestor={currentUserProfile?.accessLevel === 'gestor'}
                    teams={teams}
                    currentUser={currentUserProfile || currentUser}
                  />
                )}
                {activeTab === Tab.SETTINGS && (
                  <Settings
                    isManager={currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor'}
                    collaborators={filteredCollaborators}
                    onAddCollaborator={handleAddCollaborator}
                    onDeleteCollaborator={handleDeleteCollaborator}
                    onEditCollaborator={handleEditCollaborator}
                    teams={(currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor') ? teams : [currentUser.role]}
                    onAddTeam={handleAddTeam}
                    onDeleteTeam={handleDeleteTeam}
                    authorizedEmails={authorizedEmails}
                    onAddAuthorizedEmail={handleAddAuthorizedEmail}
                    onDeleteAuthorizedEmail={handleDeleteAuthorizedEmail}
                    currentUser={currentUser}
                    taskTemplates={taskTemplates}
                    onAddTaskTemplate={handleAddTaskTemplate}
                    onDeleteTaskTemplate={handleDeleteTaskTemplate}
                    onAddTemplateTask={handleAddTemplateTask}
                    onDeleteTemplateTask={handleDeleteTemplateTask}
                    onAddTemplateActivity={handleAddTemplateActivity}
                    onUpdateTaskTemplate={handleUpdateTaskTemplate}
                    onUpdateTemplateTask={handleUpdateTemplateTask}
                    onDeleteTemplateActivity={handleDeleteTemplateActivity}
                    onImportData={handleImportData}
                    onUpdatePassword={handleUpdatePassword}
                    onAdminResetPassword={handleAdminResetPassword}
                  />
                )}
                {activeTab === Tab.FAQ && (
                  <FAQManager
                    faqs={faqs}
                    onAdd={handleAddFAQ}
                    onUpdate={handleUpdateFAQ}
                    onDelete={handleDeleteFAQ}
                    isAdmin={currentUser.accessLevel === 'admin'}
                    userAccessLevel={currentUser.accessLevel}
                    currentUserId={currentUser.id}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPreselectedDate(null);
        }}
        onSave={handleSaveTask}
        collaborators={filteredCollaborators}
        companies={filteredCompanies}
        faqs={faqs}
        taskTemplates={taskTemplates}
        taskToEdit={editingTask || undefined}
        preselectedDate={preselectedDate || undefined}
        initialMode={createModalMode}
        isManager={currentUserProfile?.accessLevel === 'admin' || currentUserProfile?.accessLevel === 'gestor'}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, type: null, id: null })}
        onConfirm={executeDelete}
        title={getDeleteModalInfo().title}
        description={getDeleteModalInfo().description}
      />

      <TaskDetailsModal
        isOpen={!!viewingTask}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onToggleActivity={handleToggleChecklistItem}
        collaborators={collaborators}
        companies={companies}
      />

      <ReminderNotificationModal
        isOpen={notifications.length > 0}
        tasks={notifications}
        onClose={() => setNotifications([])}
        onViewTask={(task) => {
          setViewingTask(task);
          setNotifications(prev => prev.filter(t => t.id !== task.id));
        }}
        onDismiss={(taskId) => {
          setNotifications(prev => prev.filter(t => t.id !== taskId));
        }}
      />
      {currentUserProfile?.mustChangePassword && (
        <ForceChangePasswordModal
          onUpdatePassword={handleForceUpdatePassword}
          isLoading={dataLoading}
        />
      )}

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default App;
