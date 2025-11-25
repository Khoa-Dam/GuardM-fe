'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBtnProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

export const FilterBtn: React.FC<FilterBtnProps> = ({ children, active, onClick }) => (
    <Button
        variant={active ? 'default' : 'outline'}
        size="sm"
        onClick={onClick}
        className={cn(
            'rounded-full whitespace-nowrap snap-start shrink-0 pointer-events-auto shadow-sm',
            active && 'bg-slate-900 hover:bg-slate-800'
        )}
    >
        {children}
    </Button>
);
