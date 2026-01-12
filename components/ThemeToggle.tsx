import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors group"
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon - visible in dark mode */}
                <Sun
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-0'
                        }`}
                />

                {/* Moon Icon - visible in light mode */}
                <Moon
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
        </button>
    );
};
