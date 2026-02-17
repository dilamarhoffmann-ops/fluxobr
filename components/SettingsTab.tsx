import React, { useState } from 'react';
import { User, Users, Layers, Shield, Settings as SettingsIcon } from 'lucide-react';

interface SettingsTabProps {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ active, label, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-8 py-5 text-[10px] uppercase font-black tracking-widest transition-all relative group shrink-0 ${active
            ? 'text-[var(--primary-blue)]'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
    >
        <div className={`transition-all duration-300 ${active ? 'scale-125 drop-shadow-[0_0_8px_rgba(84,131,179,0.5)]' : 'group-hover:scale-110 opacity-70'}`}>
            {icon}
        </div>
        {label}
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary-blue)] rounded-t-full shadow-[0_-4px_12px_rgba(84,131,179,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-400" />
        )}
    </button>
);

export { SettingsTab };
