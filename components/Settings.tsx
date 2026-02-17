import React, { useState, useRef } from 'react';
import {
  Shield, Users, Trash2, Plus, Layers, Lock, X,
  Edit2, CheckSquare, User, Database, ChevronRight, ShieldAlert
} from 'lucide-react';
import { Collaborator, ActivityLog } from '../types';
import { Avatar } from './ui/Avatar';
import { SettingsTab } from './SettingsTab';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface SettingsProps {
  isManager: boolean;
  collaborators: Collaborator[];
  onAddCollaborator: (name: string, role: string, isManager: boolean, email: string, accessLevel: string, allowed?: boolean, area?: string) => void;
  onDeleteCollaborator: (id: string) => void;
  onEditCollaborator: (id: string, name: string, role: string, isManager: boolean, accessLevel: string, allowed?: boolean, area?: string) => void;
  teams: string[];
  onAddTeam: (teamName: string) => void;
  onDeleteTeam: (teamName: string) => void;
  authorizedEmails: Array<{ id: string, email: string, full_name?: string, role?: string, is_manager?: boolean, access_level?: string }>;
  onAddAuthorizedEmail: (email: string, name: string, role: string, isManager: boolean, accessLevel: string) => void;
  onDeleteAuthorizedEmail: (id: string) => void;
  currentUser: Collaborator;
  taskTemplates: any[];
  onAddTaskTemplate: (template: any) => Promise<string | null>;
  onDeleteTaskTemplate: (id: string) => void;
  onAddTemplateTask: (templateId: string, task: any) => Promise<string | null>;
  onDeleteTemplateTask: (templateId: string, taskId: string) => void;
  onAddTemplateActivity: (templateId: string, taskId: string, activityTitle: string) => void;
  onUpdateTaskTemplate: (id: string, updates: any) => void;
  onUpdateTemplateTask: (templateId: string, taskId: string, updates: any) => void;
  onDeleteTemplateActivity: (templateId: string, taskId: string, activityId: string) => void;
  onImportData: (data: any[]) => void;
  onUpdatePassword: (password: string) => Promise<void>;
  onAdminResetPassword: (userId: string) => Promise<void>;
  activityLogs: ActivityLog[];
}

type TabType = 'perfil' | 'membros' | 'equipes' | 'templates' | 'auditoria';

export const Settings: React.FC<SettingsProps> = (props) => {
  const {
    collaborators, teams, authorizedEmails, currentUser, taskTemplates,
    onAddCollaborator, onDeleteCollaborator, onEditCollaborator,
    onAddTeam, onDeleteTeam,
    onAddTaskTemplate, onDeleteTaskTemplate, onAddTemplateTask, onDeleteTemplateTask,
    onAddTemplateActivity, onUpdateTaskTemplate, onUpdateTemplateTask, onDeleteTemplateActivity,
    onUpdatePassword, onAdminResetPassword, activityLogs, onDeleteAuthorizedEmail
  } = props;

  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  // States do formulário de colaborador
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabAccessLevel, setNewCollabAccessLevel] = useState('colaborador');
  const [newCollabAllowed, setNewCollabAllowed] = useState(true);
  const [newCollabArea, setNewCollabArea] = useState('');
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);
  const [newCollabPassword, setNewCollabPassword] = useState('');

  // States de Templates
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [activeTaskForm, setActiveTaskForm] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // States para o Modal de Confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'warning' | 'danger' | 'info';
  }>({
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const resetForm = () => {
    setNewCollabName(''); setNewCollabRole(''); setNewCollabEmail('');
    setNewCollabAccessLevel('colaborador'); setNewCollabPassword('');
    setNewCollabAllowed(true); setNewCollabArea('');
    setEditingCollabId(null);
  };

  const handleCollaboratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollabName && newCollabRole) {
      const isManagerFlag = newCollabAccessLevel === 'gestor' || newCollabAccessLevel === 'admin';
      if (editingCollabId && editingCollabId !== 'new') {
        onEditCollaborator(editingCollabId, newCollabName, newCollabRole, isManagerFlag, newCollabAccessLevel, newCollabAllowed, newCollabArea);
      } else {
        if (!newCollabEmail) { alert("O e-mail é obrigatório."); return; }
        onAddCollaborator(newCollabName, newCollabRole, isManagerFlag, newCollabEmail, newCollabAccessLevel, newCollabAllowed, newCollabArea);
      }
      if (editingCollabId === currentUser.id && newCollabPassword) { onUpdatePassword(newCollabPassword); }
      resetForm();
    }
  };

  const getLevelBadge = (level?: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-500/10 text-red-600 border-red-200',
      gestor: 'bg-amber-500/10 text-amber-600 border-amber-200',
      colaborador: 'bg-slate-500/10 text-slate-600 border-slate-200'
    };
    const labels: Record<string, string> = { admin: 'Administrador', gestor: 'Gestor', colaborador: 'Colaborador' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[level || 'colaborador']}`}>{labels[level || 'colaborador']}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 px-4">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Personalize sua experiência e gerencie sua infraestrutura.</p>
      </div>

      {/* Navegação por Abas Premium */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 mx-4">
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-700/50">
          <SettingsTab active={activeTab === 'perfil'} label="Meu Perfil" icon={<User className="w-4 h-4" />} onClick={() => setActiveTab('perfil')} />
          {(currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor') && (
            <>
              <SettingsTab active={activeTab === 'equipes'} label="Equipes" icon={<Database className="w-4 h-4" />} onClick={() => setActiveTab('equipes')} />
              <SettingsTab active={activeTab === 'membros'} label="Membros" icon={<Users className="w-4 h-4" />} onClick={() => setActiveTab('membros')} />
              <SettingsTab active={activeTab === 'templates'} label="Modelos" icon={<Layers className="w-4 h-4" />} onClick={() => setActiveTab('templates')} />
              <SettingsTab active={activeTab === 'auditoria'} label="Auditoria" icon={<ShieldAlert className="w-4 h-4" />} onClick={() => setActiveTab('auditoria')} />
            </>
          )}
        </div>

        <div className="p-4 md:p-8">
          {/* SEÇÃO: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <Avatar name={currentUser.name} src={currentUser.avatar} size="lg" />
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
                    {getLevelBadge(currentUser.accessLevel)}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{currentUser.email}</p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{currentUser.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Nível de Acesso
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {currentUser.accessLevel === 'admin'
                      ? 'Acesso total ao sistema. Você pode gerenciar empresas, usuários, faturamentos e configurações globais.'
                      : currentUser.accessLevel === 'gestor'
                        ? 'Acesso de gestão. Você pode visualizar todas as tarefas da sua equipe e gerenciar membros do seu squad.'
                        : 'Acesso individual. Focado na execução das suas tarefas e visualização dos dados da sua equipe.'}
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Alterar Senha
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Nova senha (mínimo 6 caracteres)"
                      className="w-full text-sm px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      value={newCollabPassword}
                      onChange={(e) => setNewCollabPassword(e.target.value)}
                    />
                    <button
                      onClick={() => {
                        if (newCollabPassword.length < 6) return alert('Senha muito curta.');
                        onUpdatePassword(newCollabPassword);
                        setNewCollabPassword('');
                      }}
                      className="w-full py-2 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
                    >
                      Atualizar Senha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO: MEMBROS */}
          {activeTab === 'membros' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Usuários do Sistema</h3>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{collaborators.length} Usuários Detectados</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCollabId('new')}
                  className="btn-premium flex items-center gap-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Novo Membro
                </button>
              </div>

              {(editingCollabId === 'new' || (editingCollabId && editingCollabId !== 'new')) && (
                <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl space-y-6 mb-8 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase underline decoration-indigo-500/30 underline-offset-8 decoration-2">{editingCollabId === 'new' ? 'Adicionar Novo Usuário' : 'Editar Perfil de Membro'}</h4>
                    <button onClick={resetForm} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <form onSubmit={handleCollaboratorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                      <input type="text" className="w-full text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all shadow-sm" value={newCollabName} onChange={e => setNewCollabName(e.target.value)} required />
                    </div>
                    {editingCollabId === 'new' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">E-mail Corporativo</label>
                        <input type="email" className="w-full text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all shadow-sm" value={newCollabEmail} onChange={e => setNewCollabEmail(e.target.value)} required />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Equipe / Squad</label>
                      <select className="w-full text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold transition-all shadow-sm" value={newCollabRole} onChange={e => setNewCollabRole(e.target.value)} required>
                        <option value="">Selecione a Equipe...</option>
                        {teams?.map((t, i) => <option key={i} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nível de Acesso</label>
                      <select className="w-full text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white shadow-sm" value={newCollabAccessLevel} onChange={e => setNewCollabAccessLevel(e.target.value)}>
                        <option value="colaborador">Colaborador</option>
                        <option value="gestor">Gestor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Área / Departamento</label>
                      <input type="text" className="w-full text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm" value={newCollabArea} onChange={e => setNewCollabArea(e.target.value)} placeholder="Ex: Financeiro" />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={newCollabAllowed} onChange={e => setNewCollabAllowed(e.target.checked)} />
                        <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500 shadow-inner"></div>
                        <span className="ml-3 text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">Autorizar acesso imediato</span>
                      </label>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 mt-6 border-t border-indigo-100 dark:border-indigo-900/50 pt-6">
                      {editingCollabId !== 'new' && editingCollabId !== currentUser.id && (
                        <button type="button" onClick={() => {
                          setConfirmModalConfig({
                            title: "Resetar Segurança",
                            message: `Deseja realmente resetar a senha deste usuário para "123mudar"? Ele será solicitado a criar uma nova senha no próximo acesso.`,
                            onConfirm: () => onAdminResetPassword(editingCollabId!),
                            variant: 'warning'
                          });
                          setIsConfirmModalOpen(true);
                        }} className="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-all shadow-sm">Resetar Segurança</button>
                      )}
                      <button type="submit" className="btn-premium px-10 shadow-indigo-200 dark:shadow-none">Salvar Alterações</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border border-white/20 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                {/* Header da Tabela conforme modelo */}
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] gap-4 px-10 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 items-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificação</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Departamento</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Nível</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</div>
                </div>

                {/* Linhas da Tabela */}
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {collaborators.map(collab => (
                    <div key={collab.id} className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] gap-4 px-10 py-6 items-center hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all group">
                      {/* Identificação */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar name={collab.name} src={collab.avatar} size="md" className="ring-4 ring-white dark:ring-slate-900 shadow-sm" />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${collab.allowed === false ? 'bg-amber-400' : 'bg-emerald-500'} shadow-sm`}></div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{collab.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase tracking-tighter">{collab.email}</p>
                        </div>
                      </div>

                      {/* Departamento */}
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-800 dark:text-white tracking-widest uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {collab.area || 'N/A'}
                        </span>
                      </div>

                      {/* Nível */}
                      <div className="flex justify-center">
                        <span className={`text-[9px] font-black px-4 py-2 rounded-full border shadow-sm uppercase tracking-[0.15em] ${collab.accessLevel === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          collab.accessLevel === 'gestor' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                          {collab.accessLevel || 'Colaborador'}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex justify-center">
                        <span className={`text-[9px] font-black px-4 py-2 rounded-full border shadow-sm uppercase tracking-[0.15em] flex items-center gap-2 ${collab.allowed === false ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${collab.allowed === false ? 'bg-amber-400 animator-pulse' : 'bg-emerald-500'}`} />
                          {collab.allowed === false ? 'Pendente' : 'Autorizado'}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {currentUser.accessLevel === 'admin' && collab.id !== currentUser.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModalConfig({
                                title: "Remover Membro",
                                message: `Tem certeza que deseja remover o acesso de ${collab.name}? Esta ação não pode ser desfeita.`,
                                onConfirm: () => onDeleteCollaborator(collab.id),
                                variant: 'danger'
                              });
                              setIsConfirmModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform active:scale-90 border border-rose-100 shadow-sm"
                            title="Bloquear/Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCollabId(collab.id); setNewCollabName(collab.name); setNewCollabRole(collab.role);
                            setNewCollabAccessLevel(collab.accessLevel || 'colaborador'); setNewCollabAllowed(collab.allowed !== false);
                            setNewCollabArea(collab.area || '');
                          }}
                          className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all transform active:scale-90 hover:rotate-6"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser.accessLevel === 'admin' && collab.id !== currentUser.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModalConfig({
                                title: "Resetar Senha",
                                message: `Deseja realmente resetar a senha de ${collab.name} para "123mudar"?`,
                                onConfirm: () => onAdminResetPassword(collab.id),
                                variant: 'warning'
                              });
                              setIsConfirmModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all transform active:scale-95 border border-slate-200 shadow-sm"
                            title="Resetar"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {authorizedEmails.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Convites Pendentes / Autorizados</h4>
                  <div className="space-y-2">
                    {authorizedEmails.map(auth => (
                      <div key={auth.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                            {auth.email ? auth.email[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{auth.email || 'E-mail indisponível'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{auth.role} • {auth.access_level}</p>
                          </div>
                        </div>
                        <button onClick={() => onDeleteAuthorizedEmail(auth.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO: EQUIPES */}
          {activeTab === 'equipes' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-2xl bg-white dark:bg-slate-800/40 p-8 border border-slate-100 dark:border-slate-700/50 rounded-[2rem] shadow-sm space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gerenciar Departamentos & Equipes</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Estruture sua organização adicionando squads ou departamentos.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {teams.map((team, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 group hover:border-red-200 dark:hover:border-red-900 transition-colors shadow-sm">
                      {team}
                      <button onClick={() => { if (confirm(`Remover equipe "${team}"?`)) onDeleteTeam(team); }} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                  <form onSubmit={(e) => { e.preventDefault(); if (newTeamName) { onAddTeam(newTeamName); setNewTeamName(''); } }} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nome da nova equipe (ex: Suporte Técnico)"
                      className="flex-1 text-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all shadow-inner"
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      required
                    />
                    <button type="submit" className="px-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-90 shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Modelos de Checklist</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Automatize o planejamento de checklists recorrentes.</p>
                </div>
                <button
                  onClick={() => setEditingTemplateId('new')}
                  className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                >
                  <Plus className="w-4 h-4" /> Novo Template
                </button>
              </div>

              {editingTemplateId === 'new' && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-3xl animate-in zoom-in-95 duration-200">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (newTemplateName) {
                      await onAddTaskTemplate({ name: newTemplateName, description: newTemplateDesc });
                      setNewTemplateName(''); setNewTemplateDesc(''); setEditingTemplateId(null);
                    }
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Nome do Modelo (ex: Integração Cliente)" className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} required />
                      <input placeholder="Descrição Curta" className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm dark:text-white focus:ring-2 focus:ring-indigo-500" value={newTemplateDesc} onChange={e => setNewTemplateDesc(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setEditingTemplateId(null)} className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700">Cancelar</button>
                      <button type="submit" className="px-8 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95">Criar Modelo</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {taskTemplates.map(template => (
                  <div key={template.id} className="group border border-slate-100 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/40 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                    <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"><Layers className="w-5 h-5" /></div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">{template.name}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{template.description || 'Sem descrição específica'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">{template.tasks.length} Objetivos</span>
                        <ChevronRight className={`w-5 h-5 text-slate-300 dark:text-slate-600 transition-transform duration-300 ${expandedTemplate === template.id ? 'rotate-90 text-indigo-500' : ''}`} />
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este modelo permanentemente?')) onDeleteTaskTemplate(template.id); }} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {expandedTemplate === template.id && (
                      <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/50 space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">
                          {template.tasks.map((tk: any) => (
                            <div key={tk.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-bold text-slate-800 dark:text-200 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {tk.title}</h5>
                                <button onClick={() => onDeleteTemplateTask(template.id, tk.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {tk.activities.map((act: any) => (
                                  <div key={act.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 group/act">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                                    {act.title}
                                    <button onClick={() => onDeleteTemplateActivity(template.id, tk.id, act.id)} className="opacity-0 group-hover/act:opacity-100 transition-all active:scale-95"><X className="w-3.5 h-3.5 text-red-400" /></button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input placeholder="Adicionar atividade ao checklist..." className="flex-1 text-xs px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" onKeyDown={e => { if (e.key === 'Enter') { onAddTemplateActivity(template.id, tk.id, e.currentTarget.value); e.currentTarget.value = ''; } }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setActiveTaskForm(template.id)} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                          <Plus className="w-5 h-5" /> Adicionar Tarefa ao Modelo
                        </button>
                        {activeTaskForm === template.id && (
                          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700">
                              <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nova Tarefa</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Defina o objetivo principal desta etapa do checklist.</p>
                              </div>
                              <input
                                autoFocus
                                placeholder="Ex: Configuração de DNS"
                                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                              />
                              <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => { setActiveTaskForm(null); setNewTaskTitle(''); }} className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700">Cancelar</button>
                                <button onClick={() => {
                                  if (newTaskTitle) {
                                    onAddTemplateTask(template.id, { title: newTaskTitle, priority: 'Média' });
                                    setActiveTaskForm(null);
                                    setNewTaskTitle('');
                                  }
                                }} className="px-10 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none uppercase tracking-wider active:scale-95 transition-transform">Salvar Etapa</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO: AUDITORIA */}
          {activeTab === 'auditoria' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registro de Auditoria</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Acompanhe as últimas ações realizadas no sistema.</p>
              </div>

              <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {activityLogs?.map((log, i) => (
                  <div key={log.id || i} className="relative flex items-start gap-6 group">
                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 shadow-sm ${log.action?.includes('criou') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      log.action?.includes('excluiu') ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                      {log.entity_type === 'tarefa' ? <CheckSquare className="w-4 h-4" /> :
                        log.entity_type === 'colaborador' ? <Users className="w-4 h-4" /> :
                          <Database className="w-4 h-4" />}
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex-1 shadow-sm group-hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {log.user_name} <span className="font-medium text-slate-400 dark:text-slate-500 mx-1"> {log.action} </span>
                          {log.entity_type} <span className="text-indigo-600 dark:text-indigo-400">"{log.entity_name}"</span>
                        </p>
                        <time className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg">
                          {new Date(log.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </time>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-2">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="py-12 text-center">
                    <ShieldAlert className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium tracking-tight">Nenhuma atividade registrada ainda.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div >
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmLabel="Confirmar"
        cancelLabel="Voltar"
      />
    </div >
  );
};
