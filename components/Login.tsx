import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor, insira seu nome de usuário');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, insira sua senha');
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

      {/* Left Side - Form Section */}
      <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center p-8 lg:p-16 relative z-10 bg-white border-r border-slate-100">
        <div className="mb-12">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 mb-6">
            <span className="font-heading text-xl">CT</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 font-heading mb-3 tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-slate-500 text-lg">
            Acesse seu dashboard e gerencie suas tarefas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
              <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Usuário</label>
            <input
              type="text"
              placeholder="ex: ana.silva"
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Lembrar de mim</span>
            </label>
            <a href="#" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-slate-400">
          Não tem uma conta? <a href="#" className="text-blue-600 font-bold hover:underline">Solicite acesso</a>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-4xl transform hover:scale-[1.02] transition-transform duration-700 ease-out">
          <img
            src="/modern-login.png"
            alt="Dashboard 3D Illustration"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center z-20">
          <p className="text-slate-400 font-medium text-sm tracking-wide">FluxoBR &copy; 2024</p>
        </div>
      </div>

    </div>
  );
};
