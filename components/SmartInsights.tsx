
import React, { useState } from 'react';
import { Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import { Task, Collaborator } from '../types';
import { analyzeProjectHealth } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface SmartInsightsProps {
  tasks: Task[];
  collaborators: Collaborator[];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ tasks, collaborators }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await analyzeProjectHealth(tasks, collaborators);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-8 text-white mb-8 relative overflow-hidden">
      {/* Decorative Wave/Circle similar to Sofbox */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading">Smart Agile Insights</h3>
        </div>
        <button
          onClick={handleGenerateInsight}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {analysis ? 'Atualizar Análise' : 'Gerar Análise IA'}
        </button>
      </div>

      {!analysis && !loading && (
        <p className="text-blue-50 text-sm max-w-2xl leading-relaxed">
          Utilize nossa inteligência artificial para identificar gargalos ocultos, analisar a carga de trabalho da equipe e receber sugestões estratégicas para otimizar suas entregas.
        </p>
      )}

      {loading && (
        <div className="py-8 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-white mb-4" />
          <p className="text-white font-medium animate-pulse">Analisando dados do projeto...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-sm leading-relaxed border border-white/20 shadow-inner">
            <div className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        </div>
      )}
    </div>
  );
};
