import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowRight,
    ShieldCheck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupabaseLoginProps {
    onLoginSuccess?: () => void;
}

type AuthView = 'login' | 'signup' | 'pending_approval';

export const SupabaseLogin: React.FC<SupabaseLoginProps> = ({ onLoginSuccess }) => {
    const { user, loading, signIn, signUp } = useAuth();
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    // Cálculo em tempo real da força da senha
    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (password.length < 6) {
            return { score: 1, label: 'Mínimo 6 caracteres', color: 'bg-rose-500' };
        }
        if (score <= 2) {
            return { score: 2, label: 'Senha Razoável', color: 'bg-amber-500' };
        }
        if (score === 3 || score === 4) {
            return { score: 3, label: 'Senha Boa', color: 'bg-blue-400' };
        }
        return { score: 4, label: 'Senha Forte', color: 'bg-emerald-400' };
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            setIsProcessing(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve conter pelo menos 6 caracteres.');
            setIsProcessing(false);
            return;
        }

        try {
            if (view === 'signup') {
                if (!fullName.trim()) {
                    setError('Por favor, insira seu nome completo.');
                    setIsProcessing(false);
                    return;
                }

                const { error: signUpError } = await signUp(normalizedEmail, password, {
                    full_name: fullName.trim(),
                    role: 'Colaborador',
                    allowed: false // Requer aprovação manual de um gestor
                });

                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    setRegisteredEmail(normalizedEmail);
                    setView('pending_approval');
                    setPassword('');
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
                    onLoginSuccess?.();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado ao conectar.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#021024]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#5483B3]/20 border-t-[#5483B3] animate-spin"></div>
                    <span className="text-[#C1E8FF] text-sm font-medium tracking-wide animate-pulse">
                        Autenticando sessão segura...
                    </span>
                </div>
            </div>
        );
    }

    if (user) return null;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#021024] relative overflow-hidden px-4 py-8 select-none">
            {/* Camada de Textura Gráfica Sutil */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px)',
                    backgroundSize: '28px 28px'
                }}
            />

            {/* Ambient Lighting Orbs nos tons Apoio */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.12, 0.22, 0.12],
                    x: [0, 20, 0],
                    y: [0, -15, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-24 -left-24 w-96 h-96 bg-[#5483B3] rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.28, 0.15],
                    x: [0, -25, 0],
                    y: [0, 20, 0]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#052659] rounded-full blur-[160px] pointer-events-none"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#5483B3]/5 rounded-full blur-[180px] pointer-events-none" />

            {/* Card Principal */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md mx-auto"
            >
                <div className="relative rounded-3xl bg-[#03152e]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(2,16,36,0.9)] p-7 sm:p-9 overflow-hidden">
                    {/* Borda Iluminada Superior (Highlight Rim) */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#5483B3]/60 to-transparent" />

                    <AnimatePresence mode="wait">
                        {view === 'pending_approval' ? (
                            /* Tela de Confirmação: Solicitação em Análise */
                            <motion.div
                                key="pending_approval"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="text-center py-3"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#052659]/80 to-[#5483B3]/20 border border-[#5483B3]/30 flex items-center justify-center relative shadow-lg">
                                    <Clock className="w-10 h-10 text-[#C1E8FF] animate-pulse" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#021024] flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#5483B3]/15 text-[#C1E8FF] border border-[#5483B3]/30 mb-3">
                                    <Sparkles className="w-3 h-3 text-[#5483B3]" />
                                    Solicitação Enviada
                                </span>

                                <h2 className="text-2xl font-bold text-white tracking-tight font-heading mb-2">
                                    Acesso em Análise
                                </h2>

                                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                    Seu cadastro para{' '}
                                    <span className="font-semibold text-white">{registeredEmail || email}</span> foi
                                    registrado com sucesso!
                                </p>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left mb-6 space-y-2">
                                    <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                                        <ShieldCheck className="w-4 h-4 text-[#7DA0CA] shrink-0 mt-0.5" />
                                        <span>
                                            Por segurança corporativa, o acesso deve ser validado e ativado por um Gestor.
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>Você poderá acessar o sistema assim que a autorização for concedida.</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('login');
                                        setError('');
                                    }}
                                    className="w-full py-3.5 px-5 rounded-xl bg-[#5483B3] hover:bg-[#3e6d9d] text-white font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#5483B3]/25 flex items-center justify-center gap-2"
                                >
                                    <span>Ir para a Tela de Login</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ) : (
                            /* Formulário de Login / Solicitar Acesso */
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Cabeçalho com Logo e Identidade */}
                                <div className="text-center mb-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5483B3] to-[#7DA0CA] opacity-25 blur-md group-hover:opacity-40 transition duration-500" />
                                            <div className="relative w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md">
                                                <img
                                                    src="/logo.svg"
                                                    alt="Gestor GN Apoio"
                                                    className="w-10 h-10 object-contain drop-shadow"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                                        {view === 'signup' ? 'Solicitar Acesso' : 'Gestor GN'}
                                    </h1>
                                    <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                                        {view === 'signup'
                                            ? 'Preencha seus dados para análise do gestor'
                                            : 'Controle inteligente de demandas e equipes'}
                                    </p>
                                </div>

                                {/* Alternador de Abas Moderno (Segmented Switcher) */}
                                <div className="grid grid-cols-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setView('login');
                                            setError('');
                                        }}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                            view === 'login'
                                                ? 'bg-[#5483B3] text-white shadow-md'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setView('signup');
                                            setError('');
                                        }}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                            view === 'signup'
                                                ? 'bg-[#5483B3] text-white shadow-md'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        Solicitar Cadastro
                                    </button>
                                </div>

                                {/* Alerta de Erro */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2.5"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Formulário */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Campo: Nome Completo (Apenas no cadastro) */}
                                    {view === 'signup' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1.5"
                                        >
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                                Nome Completo
                                            </label>
                                            <div className="relative flex items-center">
                                                <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Como você prefere ser chamado?"
                                                    disabled={isProcessing}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 transition-all duration-200"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Campo: E-mail */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                            E-mail Corporativo
                                        </label>
                                        <div className="relative flex items-center">
                                            <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="seu.email@empresa.com"
                                                disabled={isProcessing}
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Campo: Senha */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Senha
                                            </label>
                                            {view === 'login' && (
                                                <span className="text-[11px] text-slate-400">
                                                    Reset via Gestor
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                disabled={isProcessing}
                                                required
                                                minLength={6}
                                                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Indicador de Força de Senha no Cadastro */}
                                        {view === 'signup' && password.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="pt-1.5 space-y-1.5"
                                            >
                                                <div className="grid grid-cols-4 gap-1.5 h-1">
                                                    {[1, 2, 3, 4].map((step) => (
                                                        <div
                                                            key={step}
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                passwordStrength.score >= step
                                                                    ? passwordStrength.color
                                                                    : 'bg-white/10'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-400 font-medium">
                                                        Força da senha:
                                                    </span>
                                                    <span className="font-semibold text-slate-200">
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Botão de Ação Principal */}
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full mt-2 py-3.5 px-5 rounded-xl bg-[#5483B3] hover:bg-[#3e6d9d] text-white font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#5483B3]/25 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                                <span>Processando...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {view === 'signup'
                                                        ? 'Enviar Solicitação de Cadastro'
                                                        : 'Entrar no Sistema'}
                                                </span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                </form>

                                {/* Rodapé com Informação de Segurança */}
                                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#5483B3]" />
                                    <span>Ambiente protegido com criptografia de ponta a ponta</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
