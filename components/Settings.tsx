import React, { useState, useRef } from 'react';
import { Shield, ShieldAlert, Check, Users, Trash2, Plus, Briefcase, Layers, Lock, X, Edit2, Save, CheckSquare, FileUp, Download } from 'lucide-react';
import { Collaborator } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import Papa from 'papaparse';

interface SettingsProps {
  isManager: boolean; // Now acting as isAdminMode
  onToggleManager: (value: boolean) => void;
  collaborators: Collaborator[];
  onAddCollaborator: (name: string, role: string, isManager: boolean, email: string, accessLevel: string) => void;
  onDeleteCollaborator: (id: string) => void;
  onEditCollaborator: (id: string, name: string, role: string, isManager: boolean, accessLevel: string) => void;
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
}

export const Settings: React.FC<SettingsProps> = ({
  isManager: isAdminMode,
  onToggleManager,
  collaborators,
  onAddCollaborator,
  onDeleteCollaborator,
  onEditCollaborator,
  teams,
  onAddTeam,
  onDeleteTeam,
  authorizedEmails,
  onAddAuthorizedEmail,
  onDeleteAuthorizedEmail,
  currentUser,
  taskTemplates,
  onAddTaskTemplate,
  onDeleteTaskTemplate,
  onAddTemplateTask,
  onDeleteTemplateTask,
  onAddTemplateActivity,
  onUpdateTaskTemplate,
  onUpdateTemplateTask,
  onDeleteTemplateActivity,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState(''); // Team
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabAccessLevel, setNewCollabAccessLevel] = useState('colaborador');
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);

  // Template States
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [activeTaskForm, setActiveTaskForm] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newActivityTitle, setNewActivityTitle] = useState('');

  const [newTeamName, setNewTeamName] = useState('');

  // Editing States
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateDesc, setEditTemplateDesc] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleToggleClick = () => {
    if (isAdminMode) {
      onToggleManager(false);
    } else {
      setIsPasswordModalOpen(true);
      setPasswordAttempt('');
      setPasswordError(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordAttempt === ADMIN_PASSWORD) {
      onToggleManager(true);
      setIsPasswordModalOpen(false);
      setPasswordAttempt('');
    } else {
      setPasswordError(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onImportData(Array.isArray(json) ? json : [json]);
        } catch (err) {
          alert('Erro ao processar arquivo JSON.');
        }
      };
      reader.readAsText(file);
    } else {
      // Assume CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onImportData(results.data);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        error: (err) => {
          alert('Erro ao processar arquivo CSV.');
        }
      });
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "tipo,nome,equipes\nequipe,Squad Exemplo,\nempresa,Cliente Exemplo,\"Squad 1, Squad 2\"";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCollaboratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollabName && newCollabRole) {
      const isManagerFlag = newCollabAccessLevel === 'gestor' || newCollabAccessLevel === 'admin';

      if (editingCollabId) {
        onEditCollaborator(editingCollabId, newCollabName, newCollabRole, isManagerFlag, newCollabAccessLevel);
        setEditingCollabId(null);
      } else {
        if (!newCollabEmail) {
          alert("O e-mail é obrigatório para autorizar um novo membro.");
          return;
        }
        onAddCollaborator(newCollabName, newCollabRole, isManagerFlag, newCollabEmail, newCollabAccessLevel);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setNewCollabName('');
    setNewCollabRole('');
    setNewCollabEmail('');
    setNewCollabAccessLevel('colaborador');
    setEditingCollabId(null);
  };

  const handleEditClick = (collab: Collaborator) => {
    setEditingCollabId(collab.id);
    setNewCollabName(collab.name);
    setNewCollabRole(collab.role);
    setNewCollabEmail('');
    setNewCollabAccessLevel(collab.accessLevel || 'colaborador');
  };

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName) {
      onAddTeam(newTeamName);
      setNewTeamName('');
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTemplateName) {
      await onAddTaskTemplate({ name: newTemplateName, description: newTemplateDesc });
      setNewTemplateName('');
      setNewTemplateDesc('');
    }
  };

  const handleTaskSubmit = async (templateId: string) => {
    if (newTaskTitle) {
      await onAddTemplateTask(templateId, { title: newTaskTitle, description: '', priority: 'Média' });
      setNewTaskTitle('');
      setActiveTaskForm(null);
    }
  };

  const handleActivitySubmit = async (templateId: string, taskId: string) => {
    if (newActivityTitle) {
      await onAddTemplateActivity(templateId, taskId, newActivityTitle);
      setNewActivityTitle('');
    }
  };

  const startEditingTemplate = (template: any) => {
    setEditingTemplateId(template.id);
    setEditTemplateName(template.name);
    setEditTemplateDesc(template.description || '');
  };

  const saveTemplateEdit = async () => {
    if (editingTemplateId && editTemplateName) {
      await onUpdateTaskTemplate(editingTemplateId, { name: editTemplateName, description: editTemplateDesc });
      setEditingTemplateId(null);
    }
  };

  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  const saveTaskEdit = async (templateId: string) => {
    if (editingTaskId && editTaskTitle) {
      await onUpdateTemplateTask(templateId, editingTaskId, { title: editTaskTitle });
      setEditingTaskId(null);
    }
  };

  const getLevelBadge = (level?: string) => {
    switch (level) {
      case 'admin': return <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase">Administrador</span>;
      case 'gestor': return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase">Gestor</span>;
      default: return <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">Colaborador</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie preferências, permissões e equipe.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Controle de Acesso
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Modo Admin</p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                {currentUser.accessLevel === 'colaborador'
                  ? 'Acesso restrito. Somente Administradores ou Gestores podem ativar o modo de gestão e cadastro.'
                  : 'Habilita o acesso de Administrador, permitindo controle total sobre o sistema, tarefas de todas as equipes e gerenciamento de membros.'}
                <br />
                <span className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" /> Apenas usuários autorizados.
                </span>
              </p>
            </div>

            {(currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor') && (
              <button
                onClick={handleToggleClick}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isAdminMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            )}
          </div>

          {isAdminMode && currentUser.accessLevel === 'admin' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900">Acesso Administrador Ativo</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Você agora possui acesso irrestrito para gerenciar todo o dashboard.
                </p>
              </div>
            </div>
          )}

          {isAdminMode && currentUser.accessLevel !== 'admin' && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Modo de Gestão Ativado</p>
                <p className="text-sm text-amber-700 mt-1">
                  Você agora pode visualizar tarefas de toda a sua equipe e gerenciar checklist de atividades.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAdminMode && currentUser.accessLevel === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Gerenciar Departamentos / Equipes
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadTemplate}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                title="Baixar Modelo CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modelo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-1.5 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-indigo-200/50"
              >
                <FileUp className="w-4 h-4" />
                <span>Importar CSV/JSON</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.json"
                className="hidden"
              />

              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {teams.length} Equipes
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {teams.map((team, idx) => (
                <div key={idx} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-sm flex items-center gap-2 group">
                  <span>{team}</span>
                  <button
                    onClick={() => onDeleteTeam(team)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTeamSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="Nome da nova equipe (ex: DevOps)"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Criar Equipe
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdminMode && (currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'gestor') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Gerenciar Membros
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{collaborators.length} membros ativos</span>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Membros Ativos</h4>
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <img src={collab.avatar} alt={collab.name} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                    <div>
                      <p className="font-medium text-slate-800">{collab.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">{collab.role}</p>
                        {getLevelBadge(collab.accessLevel)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(collab)}
                      className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar Colaborador"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {currentUser.accessLevel === 'admin' && (
                      <button
                        type="button"
                        onClick={() => onDeleteCollaborator(collab.id)}
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Colaborador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {currentUser.accessLevel === 'admin' && (
              <div className={`rounded-xl p-5 border transition-colors ${editingCollabId ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${editingCollabId ? 'text-amber-900' : 'text-indigo-900'}`}>
                  {editingCollabId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingCollabId ? 'Editar Membro' : 'Adicionar Novo Membro'}
                </h4>
                <form onSubmit={handleCollaboratorSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Nome completo"
                        className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${editingCollabId ? 'border-amber-200 focus:ring-amber-500' : 'border-indigo-200 focus:ring-indigo-500'}`}
                        value={newCollabName}
                        onChange={e => setNewCollabName(e.target.value)}
                        required
                      />
                    </div>
                    {!editingCollabId && (
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">E-mail de Acesso</label>
                        <input
                          type="email"
                          placeholder="E-mail de acesso"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newCollabEmail}
                          onChange={e => setNewCollabEmail(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Departamento / Equipe</label>
                      <select
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newCollabRole}
                        onChange={e => setNewCollabRole(e.target.value)}
                        required
                      >
                        <option value="" disabled>Selecione a Equipe</option>
                        {teams.map((team, idx) => (
                          <option key={idx} value={team}>{team}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nível de Acesso</label>
                      <select
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={newCollabAccessLevel}
                        onChange={e => setNewCollabAccessLevel(e.target.value)}
                        required
                      >
                        <option value="colaborador">Colaborador (Padrão)</option>
                        <option value="gestor">Gestor (Desta equipe)</option>
                        <option value="admin">Administrador (Total)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingCollabId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-white text-slate-700 text-sm font-medium px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`text-white text-sm font-medium px-8 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 ${editingCollabId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {editingCollabId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingCollabId ? 'Salvar Alterações' : 'Adicionar Membro'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Acessos Autorizados (Convites Pendentes) */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Convites Pendentes / Acessos Autorizados</h4>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{authorizedEmails.length} autorizados</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {authorizedEmails.map((auth) => (
                  <div key={auth.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100">
                        {auth.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{auth.email}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{auth.full_name || 'Sem nome'}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{auth.role || 'Sem equipe'}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          {getLevelBadge(auth.access_level)}
                        </div>
                      </div>
                    </div>
                    {currentUser.accessLevel === 'admin' && (
                      <button
                        onClick={() => onDeleteAuthorizedEmail(auth.id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                        title="Revogar Autorização"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {authorizedEmails.length === 0 && (
                  <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs italic">Nenhum convite pendente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdminMode && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Modelos de Tarefas (Templates)
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{taskTemplates.length} modelos</span>
          </div>

          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6 font-medium">Crie estruturas de tarefas repetitivas para agilizar o lançamento de novos projetos ou demandas fixas.</p>

            <div className="space-y-4 mb-8">
              {taskTemplates.map((template) => (
                <div key={template.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-indigo-600 p-2 rounded-lg">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        {editingTemplateId === template.id ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              className="w-full text-sm font-bold bg-white border border-indigo-200 px-2 py-1 rounded"
                              value={editTemplateName}
                              onChange={e => setEditTemplateName(e.target.value)}
                            />
                            <input
                              type="text"
                              className="w-full text-xs bg-white border border-slate-200 px-2 py-1 rounded"
                              value={editTemplateDesc}
                              onChange={e => setEditTemplateDesc(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button onClick={saveTemplateEdit} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded">Salvar</button>
                              <button onClick={() => setEditingTemplateId(null)} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-bold text-slate-800">{template.name}</p>
                            <p className="text-xs text-slate-500">{template.description || 'Sem descrição'}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                        {template.tasks.length} Tarefas
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditingTemplate(template); }}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteTaskTemplate(template.id); }} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedTemplate === template.id && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-4 animate-fade-in shadow-inner">
                      <div className="space-y-4">
                        {template.tasks.map((tk: any) => (
                          <div key={tk.id} className="pl-4 border-l-2 border-indigo-200 py-2">
                            <div className="flex items-center justify-between mb-2">
                              {editingTaskId === tk.id ? (
                                <div className="flex gap-2 items-center flex-1 pr-4">
                                  <input
                                    type="text"
                                    className="flex-1 text-sm font-semibold bg-white border border-indigo-200 px-2 py-1 rounded"
                                    value={editTaskTitle}
                                    onChange={e => setEditTaskTitle(e.target.value)}
                                  />
                                  <button onClick={() => saveTaskEdit(template.id)} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded">Salvar</button>
                                  <button onClick={() => setEditingTaskId(null)} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded">X</button>
                                </div>
                              ) : (
                                <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> {tk.title}
                                </p>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingTask(tk)}
                                  className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteTemplateTask(template.id, tk.id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                  title="Excluir tarefa do modelo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Atividades / Checklist */}
                            <div className="space-y-1.5 ml-5">
                              {tk.activities.map((act: any) => (
                                <div key={act.id} className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit group">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                                  {act.title}
                                  <button
                                    onClick={() => onDeleteTemplateActivity(template.id, tk.id, act.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}

                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Nova atividade..."
                                  className="text-[11px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-40"
                                  value={newActivityTitle || ''}
                                  onChange={e => setNewActivityTitle(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleActivitySubmit(template.id, tk.id)}
                                />
                                <button onClick={() => handleActivitySubmit(template.id, tk.id)} className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-900">Add</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {activeTaskForm === template.id ? (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Título da Tarefa do Modelo"
                            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 mb-2"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button onClick={() => setActiveTaskForm(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded">Cancelar</button>
                            <button onClick={() => handleTaskSubmit(template.id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 font-bold">Salvar Tarefa</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveTaskForm(template.id)}
                          className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Tarefa ao Modelo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Criar Novo Modelo de Checklist
              </h4>
              <form onSubmit={handleTemplateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Modelo (ex: Auditoria Mensal)"
                  className="text-sm px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Descrição breve"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTemplateDesc}
                    onChange={e => setNewTemplateDesc(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap">
                    Criar Modelo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Acesso Administrativo</h3>
                  <p className="text-xs text-slate-500">Digite a senha para confirmar.</p>
                </div>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  autoFocus
                  placeholder="Senha Administrativa"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${passwordError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-500'}`}
                  value={passwordAttempt}
                  onChange={(e) => {
                    setPasswordAttempt(e.target.value);
                    setPasswordError(false);
                  }}
                />
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Senha incorreta. Tente novamente.</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
