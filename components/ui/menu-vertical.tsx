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
}

export const MenuVertical = ({
    menuItems = [],
    color = "#3b82f6", // Defaulting to a blue to match the theme
    skew = 0,
    onItemClick,
    activeHref,
}: MenuVerticalProps) => {
    return (
        <div className="flex w-full flex-col gap-2 px-4">
            {menuItems.map((item, index) => {
                const isActive = activeHref === item.href;

                return (
                    <motion.div
                        key={`${item.href}-${index}`}
                        className="group/nav flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300"
                        initial="initial"
                        whileHover="hover"
                        onClick={() => onItemClick?.(item.href)}
                    >
                        <motion.div
                            variants={{
                                initial: { x: -20, color: "inherit", opacity: 0 },
                                hover: { x: 0, color: color, opacity: 1 },
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="z-0"
                        >
                            <ArrowRight strokeWidth={3} className="w-5 h-5" />
                        </motion.div>

                        <motion.div
                            variants={{
                                initial: { x: -25, color: isActive ? color : "inherit" },
                                hover: { x: 0, color: color, skewX: skew },
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`font-semibold text-lg no-underline transition-colors ${isActive ? 'text-blue-600' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
};
