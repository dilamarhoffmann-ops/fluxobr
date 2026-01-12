
import React, { useState } from 'react';
import { Shield, ShieldAlert, Check, Users, Trash2, Plus, Briefcase, Layers, Lock, X, Edit2, Save } from 'lucide-react';
import { Collaborator } from '../types';
import { ADMIN_PASSWORD } from '../constants';

interface SettingsProps {
  isManager: boolean;
  onToggleManager: (value: boolean) => void;
  collaborators: Collaborator[];
  onAddCollaborator: (name: string, role: string) => void;
  onDeleteCollaborator: (id: string) => void;
  onEditCollaborator: (id: string, name: string, role: string) => void;
  teams: string[];
  onAddTeam: (teamName: string) => void;
  onDeleteTeam: (teamName: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  isManager, 
  onToggleManager,
  collaborators,
  onAddCollaborator,
  onDeleteCollaborator,
  onEditCollaborator,
  teams,
  onAddTeam,
  onDeleteTeam
}) => {
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState(''); // This will store the selected team string
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleToggleClick = () => {
    if (isManager) {
      // Turning off does not require password
      onToggleManager(false);
    } else {
      // Turning on requires password
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

  const handleCollaboratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollabName && newCollabRole) {
      if (editingCollabId) {
        onEditCollaborator(editingCollabId, newCollabName, newCollabRole);
        setEditingCollabId(null);
      } else {
        onAddCollaborator(newCollabName, newCollabRole);
      }
      setNewCollabName('');
      setNewCollabRole('');
    }
  };

  const handleEditClick = (collab: Collaborator) => {
    setEditingCollabId(collab.id);
    setNewCollabName(collab.name);
    setNewCollabRole(collab.role);
  };

  const cancelEdit = () => {
    setEditingCollabId(null);
    setNewCollabName('');
    setNewCollabRole('');
  };

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName) {
      onAddTeam(newTeamName);
      setNewTeamName('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie preferências, permissões e equipe.</p>
      </div>

      {/* Access Control Card */}
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
              <p className="font-medium text-slate-900">Modo Gestor</p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Habilita funcionalidades administrativas, incluindo a criação, edição avançada e deleção de tarefas, além de gerenciamento de equipes e membros.
                <br />
                <span className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" /> Apenas para usuários autorizados.
                </span>
              </p>
            </div>
            
            <button
              onClick={handleToggleClick}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isManager ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isManager ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {isManager && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                   <Check className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                   <p className="text-sm font-medium text-indigo-900">Acesso Administrativo Ativo</p>
                   <p className="text-sm text-indigo-700 mt-1">
                      Você agora pode gerenciar tarefas, empresas e a equipe de colaboradores.
                   </p>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Team Management Card - Only visible in Manager Mode */}
      {isManager && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Gerenciar Departamentos / Equipes
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{teams.length} equipes</span>
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
      
      {/* Collaborator Management Card - Only visible in Manager Mode */}
      {isManager && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Gerenciar Membros
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{collaborators.length} membros</span>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-8">
               {collaborators.map((collab) => (
                 <div key={collab.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src={collab.avatar} alt={collab.name} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                      <div>
                        <p className="font-medium text-slate-800">{collab.name}</p>
                        <p className="text-xs text-slate-500">{collab.role}</p>
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
                      <button 
                        type="button"
                        onClick={() => onDeleteCollaborator(collab.id)}
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Colaborador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               ))}
            </div>

            <div className={`rounded-xl p-5 border transition-colors ${editingCollabId ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${editingCollabId ? 'text-amber-900' : 'text-indigo-900'}`}>
                {editingCollabId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                {editingCollabId ? 'Editar Membro' : 'Adicionar Novo Membro'}
              </h4>
              <form onSubmit={handleCollaboratorSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${editingCollabId ? 'border-amber-200 focus:ring-amber-500' : 'border-indigo-200 focus:ring-indigo-500'}`}
                    value={newCollabName}
                    onChange={e => setNewCollabName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                   <select
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-900 text-white"
                    value={newCollabRole}
                    onChange={e => setNewCollabRole(e.target.value)}
                    required
                  >
                    <option value="" disabled className="text-slate-400">Selecione a Equipe</option>
                    {teams.map((team, idx) => (
                      <option key={idx} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  {editingCollabId && (
                     <button 
                       type="button"
                       onClick={cancelEdit}
                       className="bg-white text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                     >
                       Cancelar
                     </button>
                  )}
                  <button 
                    type="submit"
                    className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 ${editingCollabId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                  >
                    {editingCollabId ? <Save className="w-4 h-4" /> : null}
                    {editingCollabId ? 'Salvar Alterações' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 opacity-60 pointer-events-none">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">Notificações (Em breve)</h3>
         <p className="text-sm text-slate-500">Configurações de alerta por email e push notification.</p>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6">
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-100 p-2 rounded-lg">
                      <Lock className="w-5 h-5 text-indigo-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-slate-800">Acesso Restrito</h3>
                     <p className="text-xs text-slate-500">Digite a senha administrativa.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handlePasswordSubmit}>
               <div className="mb-4">
                 <input 
                   type="password" 
                   autoFocus
                   placeholder="Senha (Dica: admin)"
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
