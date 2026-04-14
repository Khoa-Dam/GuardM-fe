'use client';

import { VerificationLevel } from '@/types/verification';

export const typeColors = [
    '#ef4444',
    '#f97316',
    '#facc15',
    '#22c55e',
    '#3b82f6',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
];

export const severityLabels: Record<string, string> = {
    low: 'Low',
    medium: 'Moderate',
    high: 'High',
};

export const statusLabels: Record<number, string> = {
    0: 'Active',
    1: 'Under investigation',
    2: 'Closed',
};

export const verificationText: Record<VerificationLevel, string> = {
    [VerificationLevel.UNVERIFIED]: 'Unverified',
    [VerificationLevel.PENDING]: 'Pending review',
    [VerificationLevel.VERIFIED]: 'Preliminarily verified',
    [VerificationLevel.CONFIRMED]: 'Confirmed',
};

