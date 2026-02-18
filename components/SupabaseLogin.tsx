import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

interface SupabaseLoginProps {
    onLoginSuccess?: () => void;
}

export const SupabaseLogin: React.FC<SupabaseLoginProps> = ({ onLoginSuccess }) => {
    const { user, loading, signIn, signUp, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsProcessing(true);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError('Por favor, preencha todos os campos obrigatórios');
            setIsProcessing(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setIsProcessing(false);
            return;
        }

        try {
            if (isSignUp) {
                // Durante o registro, novos usuários são marcados com allowed: false por padrão (via trigger ou manual)
                // Aqui passamos os metadados para o trigger do Supabase
                const { error: signUpError } = await signUp(normalizedEmail, password, {
                    full_name: fullName,
                    role: 'Colaborador', // Default role
                    allowed: false      // Needs manual approval
                });

                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    setSuccess('Solicitação enviada! Um gestor precisa aprovar seu acesso.');
                    setEmail('');
                    setPassword('');
                    setFullName('');
                    // Não chamamos onLoginSuccess aqui pois o usuário ainda não está 'allowed'
                    // O App.tsx lidará com a tela de "Acesso em Análise"
                }
            } else {
                const { error: signInError } = await signIn(normalizedEmail, password);

                if (signInError) {
                    if (signInError.message.includes('Invalid login credentials')) {
                        setError('E-mail ou senha incorretos.');
                    } else {
                        setError(signInError.message);
                    }
                } else {
                    // Sucesso no login - App.tsx verificará o perfil e a flag 'allowed'
                    onLoginSuccess?.();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#021024]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5483B3]"></div>
                    <span className="text-slate-400 font-medium animate-pulse">Autenticando...</span>
                </div>
            </div>
        );
    }

    if (user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#021024] relative overflow-hidden p-6">
            {/* Background Decorativo Dinâmico */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5483B3]/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#052659]/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="glass-card p-10 rounded-2xl max-w-md w-full relative z-10 animate-slide-up border-white/5 shadow-premium">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6 group">
                        <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                            <img src="/logo.svg" alt="Checklist Apoio Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 font-heading tracking-tight">
                        {isSignUp ? 'Solicitar Acesso' : 'Bem-vindo'}
                    </h2>
                    <p className="text-slate-400 font-medium lowercase tracking-wide">
                        {isSignUp
                            ? 'Cadastre-se para análise do gestor'
                            : 'Gerenciamento inteligente squads'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {(error || success) && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium animate-fade-in border ${error
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}
                        >
                            {error || success}
                        </div>
                    )}

                    {isSignUp && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="premium-input bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                placeholder="Como devemos te chamar?"
                                disabled={isProcessing}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            E-mail Corporativo
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="premium-input bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                            placeholder="seu@trabalho.com"
                            required
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Senha
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="premium-input bg-white/5 border-white/10 text-white placeholder:text-slate-600 pr-12"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                disabled={isProcessing}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full btn-premium py-4 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                <span>Processando...</span>
                            </div>
                        ) : (
                            <span>{isSignUp ? 'Enviar Solicitação' : 'Entrar no Sistema'}</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setSuccess('');
                        }}
                        className="text-slate-400 hover:text-[#5483B3] font-bold text-xs uppercase tracking-widest transition-colors"
                        disabled={isProcessing}
                    >
                        {isSignUp
                            ? 'Já possui acesso? Voltar ao login'
                            : 'Não possui conta? Solicitar cadastro'}
                    </button>
                </div>
            </div>
        </div>
    );
};
