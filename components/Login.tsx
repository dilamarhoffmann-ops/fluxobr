import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
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
    onLogin(username);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center bg-[linear-gradient(135deg,#4facfe_0%,#00f2fe_100%)] font-sans">

      {/* Background White Wave Effect */}
      <div
        className="absolute bottom-0 left-0 w-full h-[30%] bg-white z-0 pointer-events-none"
        style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
      ></div>

      {/* Floating Illustration - Positioned relative to screen, strictly for Large Screens */}
      {/* Moved outside the container to prevent layout clipping issues */}
      <div className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-[55%] h-full pointer-events-none z-10 items-center justify-center pr-10">
        <img
          src="/login-mockup-final.png"
          className="w-full max-w-[900px] h-auto object-contain drop-shadow-2xl animate-fade-in-up"
          alt="Dashboard Analytics Mockup"
          style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.25))' }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">

          {/* Login Card */}
          <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] lg:ml-[5%] animate-fade-in relative backdrop-blur-sm bg-white/95">
            <div className="mb-8 text-center">
              <h2 className="text-[#2c3e50] text-3xl font-bold mb-2 font-heading">
                Bem-vindo
              </h2>
              <p className="text-slate-400 text-sm">Insira seus dados para acessar o AgilePulse</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 animate-shake">
                  {error}
                </div>
              )}
              <div className="mb-5 group">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Usuário</label>
                <input
                  type="text"
                  placeholder="Seu usuário"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-6 group">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Senha</label>
                <input
                  type="password"
                  placeholder="Sua senha"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none p-3.5 rounded-lg font-bold cursor-pointer text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                ACESSAR SISTEMA
              </button>

              <div className="flex justify-between text-xs text-slate-500 mt-6 px-1">
                <a href="#" className="hover:text-blue-600 transition-colors">Esqueceu a Senha?</a>
                <a href="#" className="hover:text-blue-600 transition-colors font-semibold">Criar Conta</a>
              </div>
            </form>
          </div>

          {/* Spacer for Flex Layout on Large Screens to push form left and leave space for image */}
          <div className="hidden lg:block w-1/2"></div>
        </div>
      </div>
    </div>
  );
};
