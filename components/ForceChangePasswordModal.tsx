import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';

interface ForceChangePasswordModalProps {
    onUpdatePassword: (password: string) => Promise<void>;
    isLoading: boolean;
}

export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({ onUpdatePassword, isLoading }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não conferem.');
            return;
        }
        await onUpdatePassword(password);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Alteração de Senha Necessária</h2>
                    <p className="text-slate-600 mt-2">
                        Sua senha foi redefinida pelo administrador ou é uma senha padrão insegura.
                        Por favor, defina uma nova senha para continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-500 uppercase">Nova Senha</label>
                        <input
                            type="password"
                            className="w-full mt-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 uppercase">Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full mt-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Atualizando...' : (
                            <>
                                <Save className="w-5 h-5" /> Salvar Nova Senha
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
