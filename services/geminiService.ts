import { GoogleGenAI } from "@google/genai";
import { Task, Collaborator } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProjectHealth = async (tasks: Task[], collaborators: Collaborator[]): Promise<string> => {
  const modelId = "gemini-3-flash-preview";

  const projectData = JSON.stringify({
    tasks: tasks.map(t => ({
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: collaborators.find(c => c.id === t.assigneeId)?.name || 'Unknown'
    })),
    summary: {
      total: tasks.length,
      archived: tasks.filter(t => t.status === 'Arquivado').length
    }
  });

  const prompt = `
    Atue como um Agile Coach experiente e analista de dados. 
    Analise os seguintes dados do projeto em JSON: ${projectData}.
    
    Forneça uma análise estratégica concisa (máximo 3 parágrafos) focando em:
    1. Gargalos identificados (especialmente tarefas arquivadas ou atrasadas).
    2. Alocação de recursos (alguém está sobrecarregado?).
    3. Uma sugestão de ação imediata para o líder da equipe melhorar a eficiência.
    
    Use formatação Markdown simples. Seja direto e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao conectar com o serviço de análise inteligente. Verifique sua chave de API.";
  }
};
