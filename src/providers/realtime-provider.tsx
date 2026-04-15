'use client';

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { reportsKeys } from '@/hooks/use-crime-reports';
import { statisticsKeys } from '@/hooks/use-statistics';
import { normalizeReport } from '@/hooks/use-crime-reports';
import type { VerificationCrimeReport } from '@/types/map';
import type { CrimeReportResponse } from '@/service/report.service';

// ── Public types ──────────────────────────────────────────────────────────────

export interface RealtimeCallbacks {
    onReportCreated?: (report: VerificationCrimeReport) => void;
    onReportUpdated?: (report: VerificationCrimeReport) => void;
    onReportDeleted?: (id: string) => void;
    onNearbyAlert?:  (report: VerificationCrimeReport) => void;
}

interface RealtimeContextValue {
    subscribeArea(lat: number, lng: number): void;
    unsubscribeArea(): void;
    isConnected(): boolean;
    /** Register callbacks; returns an unsubscribe function */
    subscribe(callbacks: RealtimeCallbacks): () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const queryClient   = useQueryClient();
    const { data: session } = useSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef     = useRef<any>(null);
    const subscribersRef = useRef<Set<RealtimeCallbacks>>(new Set());

    const token = (session as { accessToken?: string } | null)?.accessToken;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        let socket: ReturnType<typeof import('socket.io-client').io>;

        const init = async () => {
            const { io } = await import('socket.io-client');

            socket = io(wsUrl, {
                auth: token ? { token } : {},
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 10,
            });
            socketRef.current = socket;

            socket.on('connect', () => { /* connected */ });
            socket.on('disconnect', () => { /* disconnected */ });

            socket.on('report:created', (raw: CrimeReportResponse) => {
                const report = normalizeReport(raw);
                queryClient.setQueryData<VerificationCrimeReport[]>(
                    reportsKeys.list(),
                    (old) => old ? [report, ...old.filter(r => r.id !== report.id)] : [report]
                );
                queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
                subscribersRef.current.forEach(cb => cb.onReportCreated?.(report));
            });

            socket.on('report:updated', (raw: CrimeReportResponse) => {
                const report = normalizeReport(raw);
                queryClient.setQueryData<VerificationCrimeReport[]>(
                    reportsKeys.list(),
                    (old) => old ? old.map(r => r.id === report.id ? report : r) : [report]
                );
                subscribersRef.current.forEach(cb => cb.onReportUpdated?.(report));
            });

            socket.on('report:deleted', ({ id }: { id: string }) => {
                queryClient.setQueryData<VerificationCrimeReport[]>(
                    reportsKeys.list(),
                    (old) => old ? old.filter(r => r.id !== id) : []
                );
                queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
                subscribersRef.current.forEach(cb => cb.onReportDeleted?.(id));
            });

            socket.on('report:nearby', (raw: CrimeReportResponse) => {
                const report = normalizeReport(raw);
                subscribersRef.current.forEach(cb => cb.onNearbyAlert?.(report));
            });
        };

        init();

        return () => {
            socket?.disconnect();
            socketRef.current = null;
        };
    // Re-init only when token changes (login/logout/refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const subscribe = useCallback((callbacks: RealtimeCallbacks) => {
        subscribersRef.current.add(callbacks);
        return () => subscribersRef.current.delete(callbacks);
    }, []);

    const value: RealtimeContextValue = {
        subscribeArea:   (lat, lng) => socketRef.current?.emit('subscribe:area', { lat, lng }),
        unsubscribeArea: ()         => socketRef.current?.emit('unsubscribe:area'),
        isConnected:     ()         => socketRef.current?.connected ?? false,
        subscribe,
    };

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtimeContext(): RealtimeContextValue {
    const ctx = useContext(RealtimeContext);
    if (!ctx) throw new Error('useRealtimeContext must be used within <RealtimeProvider>');
    return ctx;
}
