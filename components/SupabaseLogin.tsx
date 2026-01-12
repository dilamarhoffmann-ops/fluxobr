import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SupabaseLoginProps {
    onLoginSuccess?: () => void;
}

export const SupabaseLogin: React.FC<SupabaseLoginProps> = ({ onLoginSuccess }) => {
    const { user, loading, signIn, signUp, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
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

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
                <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo!</h2>
                        <p className="text-slate-600">{user.email}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-slate-600">
                            <strong>ID:</strong> {user.id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                            <strong>Criado em:</strong>{' '}
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                    >
                        Sair
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
            <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
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
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
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
