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
        className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative group ${active
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
        </div>
        {label}
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
        )}
    </button>
);

export { SettingsTab };
