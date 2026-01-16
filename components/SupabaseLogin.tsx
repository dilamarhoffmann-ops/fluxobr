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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            if (isSignUp) {
                const { error: signUpError } = await signUp(email, password, {
                    full_name: fullName,
                });

                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.');
                    setEmail('');
                    setPassword('');
                    setFullName('');
                }
            } else {
                const { error: signInError } = await signIn(email, password);

                if (signInError) {
                    setError('Email ou senha incorretos');
                } else {
                    setSuccess('Login realizado com sucesso!');
                    onLoginSuccess?.();
                }
            }
        } catch (err: any) {
            let message = err.message || 'Ocorreu um erro. Tente novamente.';
            if (message.includes('User already registered')) {
                message = 'Este e-mail já está cadastrado.';
            } else if (message.includes('Invalid login credentials')) {
                message = 'Credenciais inválidas. Verifique seu e-mail e senha.';
            }
            setError(message);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setSuccess('Logout realizado com sucesso!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-slate-700 font-medium">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Se o usuário já estiver logado (user existe), este componente não deveria estar visível
    // ou deveria redirecionar. O App.tsx controla isso.
    // Se por acaso renderizar e user existir, não mostramos nada para não causar flash.
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
            <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="FluxoBR Logo" className="w-32 h-32 object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {isSignUp ? 'Criar Conta' : 'Login'}
                    </h2>
                    <p className="text-slate-600">
                        {isSignUp
                            ? 'Preencha os dados para criar sua conta'
                            : 'Entre com suas credenciais'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Seu nome completo"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {isSignUp && (
                            <p className="text-xs text-slate-500 mt-1">Mínimo de 6 caracteres</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setSuccess('');
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        {isSignUp
                            ? 'Já tem uma conta? Faça login'
                            : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};
