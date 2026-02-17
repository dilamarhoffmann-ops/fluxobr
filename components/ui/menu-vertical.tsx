"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type MenuItem = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};

interface MenuVerticalProps {
    menuItems: MenuItem[];
    color?: string;
    skew?: number;
    onItemClick?: (href: string) => void;
    activeHref?: string;
    isCollapsed?: boolean;
}

export const MenuVertical = ({
    menuItems = [],
    color = "#3b82f6", // Defaulting to a blue to match the theme
    skew = 0,
    onItemClick,
    activeHref,
    isCollapsed = false,
}: MenuVerticalProps) => {
    return (
        <div className={`flex w-full flex-col gap-2 ${isCollapsed ? 'px-0' : 'px-4'}`}>
            {menuItems.map((item, index) => {
                const isActive = activeHref === item.href;

                return (
                    <motion.div
                        key={`${item.href}-${index}`}
                        className={`group/nav flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} cursor-pointer relative ${isCollapsed ? 'px-0 py-3 mx-2' : 'px-4 py-2'} rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg shadow-black/20' : 'hover:bg-white/5'}`}
                        initial="initial"
                        whileHover="hover"
                        animate={isActive ? "active" : "initial"}
                        onClick={() => onItemClick?.(item.href)}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute left-0 w-1 h-6 rounded-r-full"
                                style={{ backgroundColor: color }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        {!isCollapsed && (
                            <motion.div
                                variants={{
                                    initial: { x: -20, color: "inherit", opacity: 0 },
                                    hover: { x: 0, color: color, opacity: 1 },
                                    active: { x: 0, color: color, opacity: 1 }
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="z-0"
                            >
                                <ArrowRight strokeWidth={3} className="w-4 h-4 opacity-70" />
                            </motion.div>
                        )}

                        <motion.div
                            variants={{
                                initial: { x: isCollapsed ? 0 : -20, color: "inherit" },
                                hover: { x: 0, color: "white", skewX: skew },
                                active: { x: 0, color: "white", skewX: skew }
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`font-bold text-sm uppercase tracking-widest no-underline ${isCollapsed ? 'flex justify-center' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(84,131,179,0.3)]"
                                    style={{ color: isActive ? color : '#94a3b8' }}
                                >
                                    {item.icon}
                                </span>
                                {!isCollapsed && (
                                    <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-white'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
};
