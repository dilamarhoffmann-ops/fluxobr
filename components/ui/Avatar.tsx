
import React from 'react';

interface AvatarProps {
    name?: string;
    src?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    title?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name = '', src, size = 'md', className = '', title }) => {
    const getInitials = (fullName: string) => {
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-7 h-7 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    // Color generator based on name
    const getColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, 60%, 45%)`;
    };

    const initials = getInitials(name);
    const backgroundColor = getColor(name);

    return (
        <div
            className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-800 ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: !src ? backgroundColor : undefined }}
            title={title || name}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                        // Falls back to initials if image fails
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};
