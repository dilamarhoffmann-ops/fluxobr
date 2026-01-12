
import React, { useState, useMemo } from 'react';
import { INITIAL_TASKS, COLLABORATORS, COMPANIES, INITIAL_TEAMS, INITIAL_FAQS } from './constants';
import { Task, TaskInput, TaskStatus, Company, Collaborator, FAQItem } from './types';
import { LayoutDashboard, CheckSquare, Settings as SettingsIcon, Bell, Menu, Building2, HelpCircle, LogOut } from 'lucide-react';
import { MetricsRow } from './components/MetricsCards';
import { DashboardCharts } from './components/DashboardCharts';
import { TaskManagement } from './components/TaskManagement';
import { Settings } from './components/Settings';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CompanyList } from './components/CompanyList';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FAQManager } from './components/FAQManager';
import { Login } from './components/Login';
import { SmartInsights } from './components/SmartInsights';
import { MenuVertical } from './components/ui/menu-vertical';
import { ThemeToggle } from './components/ThemeToggle';

enum Tab {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  COMPANIES = 'companies',
  SETTINGS = 'settings',
  FAQ = 'faq',
}

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(COLLABORATORS);
  const [teams, setTeams] = useState<string[]>(INITIAL_TEAMS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Simulated Logged In User (Defaulting to the first one: Ana Silva)
  const [currentUserId, setCurrentUserId] = useState<string>(COLLABORATORS[0].id);
  const currentUser = collaborators.find(c => c.id === currentUserId) || collaborators[0];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'task' | 'company' | 'collaborator' | 'team' | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  // Derived State for Metrics and Display
  const filteredTasks = useMemo(() => {
    if (isManager) return tasks;
    return tasks.filter(t => t.assigneeId === currentUserId);
  }, [tasks, isManager, currentUserId]);

  const filteredCompanies = useMemo(() => {
    if (isManager) return companies;
    // Show companies where user has tasks OR that match their team/role
    return companies.filter(c =>
      tasks.some(t => t.companyId === c.id && t.assigneeId === currentUserId) ||
      c.team === currentUser.role
    );
  }, [companies, tasks, isManager, currentUserId, currentUser.role]);

  const metrics = useMemo(() => {
    const targetTasks = filteredTasks;
    const totalTasks = targetTasks.length;
    const completedTasks = targetTasks.filter(t => t.status === TaskStatus.DONE).length;
    const blockedTasks = targetTasks.filter(t => t.status === TaskStatus.BLOCKED).length;
    const overdueTasks = targetTasks.filter((t: Task) => t.status !== TaskStatus.DONE && new Date(t.dueDate) < new Date()).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { totalTasks, completedTasks, blockedTasks, overdueTasks, completionRate };
  }, [filteredTasks]);

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;

      const updates: Partial<Task> = { status: newStatus };
      const now = new Date().toISOString();

      // Track Start Time if moving to In Progress for the first time
      if (newStatus === TaskStatus.IN_PROGRESS && !t.startedAt) {
        updates.startedAt = now;
      }

      // Track Completion Time
      if (newStatus === TaskStatus.DONE) {
        updates.completedAt = now;
      } else if (t.status === TaskStatus.DONE) {
        // If moving out of done, clear completedAt
        updates.completedAt = undefined;
      }

      return { ...t, ...updates };
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleSaveTask = (taskInput: TaskInput, targetCompanyIds: string[]) => {
    if (editingTask) {
      // Edit Mode: Update existing task
      setTasks(prev => prev.map(t =>
        t.id === editingTask.id
          ? { ...t, ...taskInput, companyId: targetCompanyIds[0] } // Update fields
          : t
      ));
    } else {
      // Create Mode: Create new tasks (possibly replicating across companies)
      const newTasks: Task[] = targetCompanyIds.map((companyId, index) => ({
        ...taskInput,
        companyId: companyId,
        id: `t${Date.now()}-${index}`,
        createdAt: new Date().toISOString().split('T')[0],
        startedAt: taskInput.status === TaskStatus.IN_PROGRESS ? new Date().toISOString() : undefined
      }));
      setTasks(prev => [...newTasks, ...prev]);
    }
  };

  // Handlers that trigger the Confirmation Modal
  const handleDeleteTask = (taskId: string) => {
    setDeleteConfirmation({ isOpen: true, type: 'task', id: taskId });
  };

  const handleDeleteCompany = (id: string) => {
    setDeleteConfirmation({ isOpen: true, type: 'company', id: id });
  };

  const handleDeleteCollaborator = (id: string) => {
    setDeleteConfirmation({ isOpen: true, type: 'collaborator', id: id });
  };

  const handleDeleteTeam = (teamName: string) => {
    setDeleteConfirmation({ isOpen: true, type: 'team', id: teamName });
  };

  // The actual delete execution
  const executeDelete = () => {
    const { type, id } = deleteConfirmation;
    if (!type || !id) return;

    if (type === 'task') {
      setTasks(prev => prev.filter(t => t.id !== id));
    } else if (type === 'company') {
      setCompanies(prev => prev.filter(c => c.id !== id));
      setTasks(prev => prev.filter(t => t.companyId !== id)); // Cascade delete
    } else if (type === 'collaborator') {
      setCollaborators(prev => prev.filter(c => c.id !== id));
    } else if (type === 'team') {
      setTeams(prev => prev.filter(t => t !== id));
    }
  };

  const handleAddCompany = (name: string, team: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-500', 'bg-purple-600', 'bg-orange-500', 'bg-indigo-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name,
      team: team,
      logo: randomColor
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const handleAddCollaborator = (name: string, role: string) => {
    const newCollab: Collaborator = {
      id: `c${Date.now()}`,
      name,
      role,
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`
    };
    setCollaborators(prev => [...prev, newCollab]);
  };

  const handleEditCollaborator = (id: string, name: string, role: string) => {
    setCollaborators(prev => prev.map(c =>
      c.id === id ? { ...c, name, role } : c
    ));
  };

  const handleAddTeam = (teamName: string) => {
    if (!teams.includes(teamName)) {
      setTeams(prev => [...prev, teamName]);
    }
  };

  // FAQ Handlers
  const handleAddFAQ = (faq: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    setFaqs(prev => [...prev, newFaq]);
  };

  const handleUpdateFAQ = (id: string, updatedFaq: Omit<FAQItem, 'id'>) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...updatedFaq } : f));
  };

  const handleDeleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  // Helper to get modal texts
  const getDeleteModalInfo = () => {
    switch (deleteConfirmation.type) {
      case 'task': return { title: 'Excluir Tarefa', description: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.' };
      case 'company': return { title: 'Excluir Empresa', description: 'Tem certeza? Isso excluirá a empresa e TODAS as suas tarefas associadas.' };
      case 'collaborator': return { title: 'Remover Membro', description: 'Tem certeza que deseja remover este membro da equipe?' };
      case 'team': return { title: 'Remover Equipe', description: 'Tem certeza? Membros existentes nesta equipe manterão o nome, mas não será possível selecionar para novos.' };
      default: return { title: '', description: '' };
    }
  };

  const modalInfo = getDeleteModalInfo();

  // AUTH GUARD
  const handleLogin = (username: string) => {
    const user = collaborators.find(c =>
      c.name.toLowerCase() === username.toLowerCase() ||
      c.id.toLowerCase() === username.toLowerCase()
    );

    if (user) {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);

      // Auto-detect manager roles
      const managerRoles = ['Product Owner', 'Scrum Master', 'Manager', 'CEO'];
      if (managerRoles.includes(user.role)) {
        setIsManager(true);
      } else {
        setIsManager(false);
      }
    } else {
      // Basic fallback if not found in collaborators
      alert("Usuário não encontrado. Tente nomes como 'Ana Silva' ou 'Carlos Souza'.");
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans transition-colors">
      {/* Sidebar Navigation - Light Theme to match Sofbox */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl lg:shadow-none`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              <span className="font-heading">CT</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-heading">Checklist Team</h1>
          </div>

          <nav className="flex-1 px-2 py-6">
            <MenuVertical
              activeHref={activeTab}
              onItemClick={(href) => {
                setActiveTab(href as Tab);
                setIsMobileMenuOpen(false);
              }}
              color="#3b82f6"
              menuItems={[
                { label: 'Dashboard', href: Tab.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
                { label: 'Minhas Tarefas', href: Tab.TASKS, icon: <CheckSquare className="w-5 h-5" /> },
                { label: 'Empresas', href: Tab.COMPANIES, icon: <Building2 className="w-5 h-5" /> },
                ...(isManager ? [{ label: 'FAQ Gestor', href: Tab.FAQ, icon: <HelpCircle className="w-5 h-5" /> }] : []),
                { label: 'Configurações', href: Tab.SETTINGS, icon: <SettingsIcon className="w-5 h-5" /> },
              ]}
            />
          </nav>

          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                {isManager ? <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> : <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>}
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 font-heading">
                  {isManager ? 'Modo Gestor' : 'Modo Leitura'}
                </span>
              </div>
              <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors mt-2">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-blue-600">
                <Menu className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden lg:block font-heading">
                {activeTab === Tab.DASHBOARD && 'Visão Geral do Projeto'}
                {activeTab === Tab.TASKS && 'Gerenciamento de Entregas'}
                {activeTab === Tab.COMPANIES && 'Empresas & Portfólio'}
                {activeTab === Tab.SETTINGS && 'Preferências do Sistema'}
                {activeTab === Tab.FAQ && 'Perguntas Frequentes (FAQ)'}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <ThemeToggle />
              <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full ring-2 ring-blue-50 dark:ring-slate-700 shadow-sm" />
                <div className="hidden md:block">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm font-heading">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">

            {activeTab === Tab.DASHBOARD && (
              <div className="space-y-8 animate-fade-in">
                <MetricsRow metrics={metrics} />
                <DashboardCharts tasks={filteredTasks} collaborators={collaborators} />

                {/* Recent Activity Mini-List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-heading">Tarefas Recentes</h3>
                    {isManager && (
                      <button
                        onClick={handleOpenCreateModal}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition-colors"
                      >
                        + Criar Nova
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredTasks.slice(0, 3).map(task => {
                      const company = companies.find(c => c.id === task.companyId);
                      return (
                        <div key={task.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors px-2 -mx-2 rounded-lg">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{task.title}</span>
                              {company && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{company.name}</span>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Atualizado em {new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${task.status === TaskStatus.DONE ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                            {task.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveTab(Tab.TASKS)}
                    className="mt-6 text-sm text-blue-600 font-bold hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    Ver todas as tarefas <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === Tab.TASKS && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">Quadro de Tarefas</h2>
                    <p className="text-slate-500 dark:text-slate-400">Acompanhe e atualize o status das atividades diárias.</p>
                  </div>
                </div>
                <TaskManagement
                  tasks={filteredTasks}
                  collaborators={collaborators}
                  companies={filteredCompanies}
                  faqs={faqs}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleOpenEditModal}
                  isManager={isManager}
                  onOpenCreateModal={handleOpenCreateModal}
                />
              </div>
            )}

            {activeTab === Tab.COMPANIES && (
              <CompanyList
                companies={filteredCompanies}
                tasks={filteredTasks}
                isManager={isManager}
                onAddCompany={handleAddCompany}
                onDeleteCompany={handleDeleteCompany}
                collaborators={collaborators}
                onUpdateStatus={handleUpdateStatus}
                onDeleteTask={handleDeleteTask}
                onOpenCreateTask={handleOpenCreateModal}
                teams={teams}
                currentUser={currentUser}
              />
            )}

            {activeTab === Tab.SETTINGS && (
              <Settings
                isManager={isManager}
                onToggleManager={setIsManager}
                collaborators={collaborators}
                onAddCollaborator={handleAddCollaborator}
                onDeleteCollaborator={handleDeleteCollaborator}
                onEditCollaborator={handleEditCollaborator}
                teams={teams}
                onAddTeam={handleAddTeam}
                onDeleteTeam={handleDeleteTeam}
              />
            )}

            {activeTab === Tab.FAQ && isManager && (
              <FAQManager
                faqs={faqs}
                onAdd={handleAddFAQ}
                onUpdate={handleUpdateFAQ}
                onDelete={handleDeleteFAQ}
              />
            )}

          </div>
        </div>
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveTask}
        collaborators={collaborators}
        companies={companies}
        faqs={faqs}
        taskToEdit={editingTask || undefined}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, type: null, id: null })}
        onConfirm={executeDelete}
        title={modalInfo.title}
        description={modalInfo.description}
      />
    </div>
  );
};

export default App;
