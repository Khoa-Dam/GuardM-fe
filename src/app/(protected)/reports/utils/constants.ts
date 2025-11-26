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
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
};

export const statusLabels: Record<number, string> = {
    0: 'Đang hoạt động',
    1: 'Đang điều tra',
    2: 'Đã đóng',
};

export const verificationText: Record<VerificationLevel, string> = {
    [VerificationLevel.UNVERIFIED]: 'Chưa xác minh',
    [VerificationLevel.PENDING]: 'Đang chờ duyệt',
    [VerificationLevel.VERIFIED]: 'Đã xác minh sơ bộ',
    [VerificationLevel.CONFIRMED]: 'Đã xác nhận',
};

