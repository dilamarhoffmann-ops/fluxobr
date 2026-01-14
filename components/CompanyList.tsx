
import React, { useState, useEffect } from 'react';
import { Company, Task, Collaborator, TaskStatus } from '../types';
import { Building2, Briefcase, Plus, Trash2, ChevronRight, LayoutGrid, Users, Edit } from 'lucide-react';
import { TaskManagement } from './TaskManagement';

interface CompanyListProps {
  companies: Company[];
  tasks: Task[];
  isManager: boolean;
  onAddCompany: (name: string, teams: string[]) => void;
  onUpdateCompany: (id: string, name: string, teams: string[]) => void;
  onDeleteCompany: (id: string) => void;
  collaborators: Collaborator[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask?: (task: Task) => void;
  onToggleChecklistItem?: (taskId: string, index: number) => void;
  onOpenCreateTask: () => void;
  teams: string[];
  currentUser: Collaborator;
  isGestor?: boolean;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  tasks,
  isManager,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  collaborators,
  onUpdateStatus,
  onDeleteTask,
  onViewTask,
  onToggleChecklistItem,
  onOpenCreateTask,
  teams,
  currentUser,
  isGestor
}) => {
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingTeamsList, setEditingTeamsList] = useState<string[]>([]);
  const [editingCompanyName, setEditingCompanyName] = useState('');

  // As empresas já vêm filtradas do App.tsx, então usamos diretamente
  const visibleCompanies = companies;

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Auto-select the first visible company if none selected or if previously selected is hidden
  useEffect(() => {
    if (visibleCompanies.length > 0) {
      if (!selectedCompanyId || !visibleCompanies.find(c => c.id === selectedCompanyId)) {
        setSelectedCompanyId(visibleCompanies[0].id);
      }
    } else {
      setSelectedCompanyId(null);
    }
  }, [visibleCompanies, selectedCompanyId]);

  const [isCreating, setIsCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTeams, setNewCompanyTeams] = useState<string[]>([]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const companyTasks = selectedCompany ? tasks.filter(t => t.companyId === selectedCompany.id) : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanyName && newCompanyTeams.length > 0) {
      onAddCompany(newCompanyName, newCompanyTeams);
      setIsCreating(false);
      setNewCompanyName('');
      setNewCompanyTeams([]);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCompany(id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in">

      {/* Left Sidebar: List of Companies */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Empresas
            </h3>
            {isManager && (
              <button
                onClick={() => setIsCreating(true)}
                className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                title="Adicionar Empresa"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Create Form (Inline) */}
          {isCreating && (
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome da Empresa"
                  className="w-full text-sm p-2 rounded border border-indigo-200 focus:outline-none focus:border-indigo-500"
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  autoFocus
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Vincular Equipes</label>
                  <div className="max-h-32 overflow-y-auto border border-indigo-100 rounded bg-white p-2 space-y-1 custom-scrollbar">
                    {teams.map((team, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                          checked={newCompanyTeams.includes(team)}
                          onChange={(e) => {
                            if (e.target.checked) setNewCompanyTeams(prev => [...prev, team]);
                            else setNewCompanyTeams(prev => prev.filter(t => t !== team));
                          }}
                        />
                        <span className="text-xs text-slate-700 font-medium">{team}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancelar</button>
                  <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Salvar</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {visibleCompanies.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm px-4">
                {isManager
                  ? "Nenhuma empresa cadastrada."
                  : `Nenhuma empresa vinculada à sua equipe (${currentUser.role}).`}
              </div>
            ) : (
              visibleCompanies.map(company => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedCompanyId === company.id
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-lg ${company.logo} flex-shrink-0 flex items-center justify-center text-white shadow-sm`}>
                      <span className="font-bold text-xs">{company.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${selectedCompanyId === company.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {company.name}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Users className="w-3 h-3" /> {company.team.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isManager && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(company.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {selectedCompanyId === company.id && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Content: Company Details & Tasks */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {selectedCompany ? (
          <div className="flex flex-col h-full gap-4">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${selectedCompany.logo} flex items-center justify-center text-white shadow-md`}>
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 truncate">{selectedCompany.name}</h2>
                    {isManager && (
                      <button
                        onClick={() => {
                          setEditingCompanyName(selectedCompany.name);
                          setEditingTeamsList(selectedCompany.team);
                          setIsEditingCompany(!isEditingCompany);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg transition-all hover:scale-105 ${isEditingCompany ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700'}`}
                        title="Editar Empresa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1 group">
                      <Users className="w-4 h-4" />
                      <span className="font-medium text-indigo-600">Equipes:</span> {selectedCompany.team.join(' • ')}
                    </div>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{companyTasks.length} Tarefas Totais</span>

                    {/* Edit Company Popover */}
                    {isEditingCompany && (
                      <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Editar Empresa</h4>
                          <button onClick={() => setIsEditingCompany(false)} className="text-slate-400 hover:text-slate-600">
                            <Plus className="w-4 h-4 rotate-45" />
                          </button>
                        </div>

                        {/* Edit Name */}
                        <div className="mb-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1.5">Nome da Empresa</label>
                          <input
                            type="text"
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={editingCompanyName}
                            onChange={e => setEditingCompanyName(e.target.value)}
                            placeholder="Nome da empresa"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar mb-4">
                          {teams.map((team, idx) => (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                checked={editingTeamsList.includes(team)}
                                onChange={(e) => {
                                  if (e.target.checked) setEditingTeamsList(prev => [...prev, team]);
                                  else setEditingTeamsList(prev => prev.filter(t => t !== team));
                                }}
                              />
                              <span className="text-sm text-slate-700 font-medium">{team}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsEditingCompany(false)}
                            className="flex-1 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              if (editingCompanyName.trim()) {
                                onUpdateCompany(selectedCompany.id, editingCompanyName.trim(), editingTeamsList);
                                setIsEditingCompany(false);
                              }
                            }}
                            disabled={editingTeamsList.length === 0 || !editingCompanyName.trim()}
                            className="flex-1 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reusing Task Management for this specific company */}
            <div className="flex-1 min-h-0">
              <TaskManagement
                tasks={companyTasks}
                collaborators={collaborators}
                companies={companies}
                onUpdateStatus={onUpdateStatus}
                onDeleteTask={onDeleteTask}
                onViewTask={onViewTask}
                onToggleChecklistItem={onToggleChecklistItem}
                isManager={isManager || isGestor}
                onOpenCreateModal={onOpenCreateTask}
                hideCompanyFilter={true}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400 p-8">
            <LayoutGrid className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Selecione uma empresa para gerenciar</p>
            <p className="text-sm">Clique em uma empresa na lista ao lado para ver suas tarefas.</p>
            {!isManager && visibleCompanies.length === 0 && (
              <p className="text-xs text-red-400 mt-2 bg-red-50 px-3 py-1 rounded-full">
                Nenhuma empresa disponível para sua equipe.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
