'use client';

import { useMemo, useState } from 'react';
import type { FilterType, VerificationCrimeReport } from '@/types/map';
import { CRIME_TYPE_OPTIONS as BASE_CRIME_TYPE_OPTIONS } from '@/constants/crime-constants';

export type TimeRange = 'all' | 'today' | '7d' | '30d';
export type CrimeTypeFilter = 'all' | 'truy_na' | 'nghi_pham' | 'dang_ngo' | 'de_doa' | 'giet_nguoi' | 'bat_coc' | 'cuop_giat' | 'trom_cap';

export const CRIME_TYPE_OPTIONS: { value: CrimeTypeFilter; label: string; color: string }[] = [
    { value: 'all', label: 'Tất cả', color: '#00d4ff' },
    ...BASE_CRIME_TYPE_OPTIONS as { value: CrimeTypeFilter; label: string; color: string }[],
];

export const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
    { value: 'all',   label: 'Tất cả' },
    { value: 'today', label: 'Hôm nay' },
    { value: '7d',    label: '7 ngày' },
    { value: '30d',   label: '30 ngày' },
];

function isWithinTimeRange(date: string | Date | undefined, range: TimeRange): boolean {
    if (range === 'all' || !date) return true;
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    if (range === 'today') return diff < 86_400_000;
    if (range === '7d')    return diff < 7  * 86_400_000;
    if (range === '30d')   return diff < 30 * 86_400_000;
    return true;
}

export function useMapFilters(reports: VerificationCrimeReport[]) {
    const [severityFilter, setSeverityFilter]     = useState<FilterType>('all');
    const [crimeTypeFilter, setCrimeTypeFilter]   = useState<CrimeTypeFilter>('all');
    const [timeRange, setTimeRange]               = useState<TimeRange>('all');
    const [showHeatmap, setShowHeatmap]           = useState(false);
    const [showGlobalAlerts, setShowGlobalAlerts] = useState(true);
    const [showExtraFilters, setShowExtraFilters] = useState(false);

    const filteredReports = useMemo(() => reports.filter(r => {
        if (severityFilter !== 'all' && r.severityLevel !== severityFilter) return false;
        if (crimeTypeFilter !== 'all' && r.type !== crimeTypeFilter) return false;
        if (!isWithinTimeRange(r.reportedAt ?? r.createdAt, timeRange)) return false;
        return true;
    }), [reports, severityFilter, crimeTypeFilter, timeRange]);

    const activeFilterCount = [
        severityFilter !== 'all',
        crimeTypeFilter !== 'all',
        timeRange !== 'all',
    ].filter(Boolean).length;

    return {
        severityFilter, setSeverityFilter,
        crimeTypeFilter, setCrimeTypeFilter,
        timeRange, setTimeRange,
        showHeatmap, setShowHeatmap,
        showGlobalAlerts, setShowGlobalAlerts,
        showExtraFilters, setShowExtraFilters,
        filteredReports,
        activeFilterCount,
    };
}
