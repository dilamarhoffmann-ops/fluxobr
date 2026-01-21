import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader } from 'lucide-react';

interface EmailTestProps {
    supabaseUrl: string;
    supabaseAnonKey: string;
}

export const EmailTest: React.FC<EmailTestProps> = ({ supabaseUrl, supabaseAnonKey }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const testEmail = async () => {
        if (!email) {
            setResult({ success: false, message: 'Por favor, insira um email válido' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const functionUrl = `${supabaseUrl}/functions/v1/notify-due-tasks?email=${encodeURIComponent(email)}`;

            console.log('Enviando requisição para:', functionUrl);

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Resposta:', data);

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: `✅ Email de teste enviado com sucesso para ${email}!`
                });
            } else {
                setResult({
                    success: false,
                    message: `❌ Erro ao enviar email: ${data.error || JSON.stringify(data)}`
                });
            }
        } catch (error: any) {
            console.error('Erro:', error);
            setResult({
                success: false,
                message: `❌ Erro na requisição: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const testFullNotification = async () => {
        setLoading(true);
        setResult(null);

        try {
            const functionUrl = `${supabaseUrl}/functions/v1/notify-due-tasks`;

            console.log('Testando notificação completa...');

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Resposta completa:', data);

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: `✅ Processadas ${data.processed} tarefas. Total verificado: ${data.total_tasks_checked}. Detalhes no console.`
                });
            } else {
                setResult({
                    success: false,
                    message: `❌ Erro: ${data.error || JSON.stringify(data)}`
                });
            }
        } catch (error: any) {
            console.error('Erro:', error);
            setResult({
                success: false,
                message: `❌ Erro na requisição: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Teste de Envio de Email
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Teste a Edge Function de notificações
                    </p>
                </div>
            </div>

            {/* Test with specific email */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email para Teste
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu-email@exemplo.com"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        disabled={loading}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enviar email de teste para verificar integração com Resend
                    </p>
                </div>

                <button
                    onClick={testEmail}
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Enviar Email de Teste
                        </>
                    )}
                </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        OU
                    </span>
                </div>
            </div>

            {/* Test full notification */}
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        Testar notificação completa (processa tarefas vencidas reais)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Isso irá verificar todas as tarefas vencidas e enviar emails para responsáveis e gestores
                    </p>
                </div>

                <button
                    onClick={testFullNotification}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <Mail className="w-5 h-5" />
                            Testar Notificação Completa
                        </>
                    )}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div
                    className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${result.success
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}
                >
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <p
                            className={`text-sm font-medium ${result.success
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-red-800 dark:text-red-200'
                                }`}
                        >
                            {result.message}
                        </p>
                        {!result.success && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Verifique o console do navegador para mais detalhes
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    📋 Pré-requisitos
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>✓ Edge Function deployada no Supabase</li>
                    <li>✓ RESEND_API_KEY configurada nas variáveis de ambiente</li>
                    <li>✓ Migration aplicada ao banco de dados</li>
                </ul>
            </div>
        </div>
    );
};
