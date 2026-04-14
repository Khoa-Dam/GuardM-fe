'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterBtnProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
    color?: string; // optional accent color
}

export const FilterBtn: React.FC<FilterBtnProps> = ({ children, active, onClick, color = '#00d4ff' }) => (
    <button
        onClick={onClick}
        className={cn(
            'relative whitespace-nowrap snap-start shrink-0 pointer-events-auto',
            'font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded',
            'border transition-all duration-200 overflow-hidden',
            active
                ? 'text-white border-opacity-60 bg-opacity-15'
                : 'border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,24,0.85)] text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
        )}
        style={active ? {
            borderColor: `${color}60`,
            backgroundColor: `${color}15`,
            color: color,
        } : {}}
    >
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
        )}
        {children}
    </button>
);
