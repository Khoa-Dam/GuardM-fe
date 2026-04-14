'use client';

import { useState, useEffect, useCallback } from 'react';
import type { VerificationCrimeReport } from '@/types/map';
import { CRIME_TYPE_LABEL } from '@/constants/crime-constants';

export interface AppNotification {
    id: string;
    reportId: string;
    title: string;
    address: string;
    severity: 'low' | 'medium' | 'high';
    type: string;
    createdAt: string;
    read: boolean;
}

const STORAGE_KEY = 'guardm:notifications';
const MAX_NOTIFICATIONS = 50;

function loadFromStorage(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveToStorage(items: AppNotification[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
    } catch { /* ignore */ }
}


export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        setNotifications(loadFromStorage());
    }, []);

    const save = useCallback((items: AppNotification[]) => {
        setNotifications(items);
        saveToStorage(items);
    }, []);

    const addFromReport = useCallback((report: VerificationCrimeReport) => {
        // Only notify for medium and high severity
        if (report.severityLevel === 'low') return;

        const notification: AppNotification = {
            id: `notif-${Date.now()}-${report.id}`,
            reportId: report.id,
            title: report.title || CRIME_TYPE_LABEL[report.type ?? ''] || 'Sự cố mới',
            address: report.address || report.district || 'Không rõ địa chỉ',
            severity: report.severityLevel,
            type: report.type || 'dang_ngo',
            createdAt: new Date().toISOString(),
            read: false,
        };

        setNotifications(prev => {
            const updated = [notification, ...prev.filter(n => n.reportId !== report.id)];
            saveToStorage(updated);
            return updated;
        });
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            saveToStorage(updated);
            return updated;
        });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveToStorage(updated);
            return updated;
        });
    }, []);

    // Seed with historical reports (marked read — no badge, just dropdown history)
    const seedFromReports = useCallback((reports: VerificationCrimeReport[]) => {
        setNotifications(prev => {
            if (prev.length > 0) return prev; // don't overwrite existing
            const seeded: AppNotification[] = reports.map(r => ({
                id: `seed-${r.id}`,
                reportId: r.id,
                title: r.title || CRIME_TYPE_LABEL[r.type ?? ''] || 'Sự cố',
                address: r.address || r.district || 'Không rõ địa chỉ',
                severity: (r.severityLevel as AppNotification['severity']) || 'medium',
                type: r.type || 'dang_ngo',
                createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt ?? Date.now()).toISOString(),
                read: true,
            }));
            saveToStorage(seeded);
            return seeded;
        });
    }, []);

    const clearAll = useCallback(() => {
        save([]);
    }, [save]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, addFromReport, seedFromReports, markRead, markAllRead, clearAll };
}
