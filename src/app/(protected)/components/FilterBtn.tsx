'use client';

import React from 'react';

interface FilterBtnProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

export const FilterBtn: React.FC<FilterBtnProps> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border whitespace-nowrap snap-start shrink-0 active:scale-95 pointer-events-auto ${active ? 'bg-slate-900 text-white border-slate-900 shadow-slate-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
    >
        {children}
    </button>
);

