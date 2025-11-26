import type { LucideIcon } from 'lucide-react';
import type { CrimeType } from '@/service/report.service';

export interface SummaryCardConfig {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    showSpinner?: boolean;
}

export interface CrimeTypeDatum extends Record<string, string | number | undefined> {
    type: CrimeType | string;
    count: number;
    label: string;
}

