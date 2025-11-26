import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportService, { CrimeReportResponse, CrimeType, UpdateCrimeReportDto } from '@/service/report.service';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';

// Query keys for cache management
export const reportsKeys = {
    all: ['reports'] as const,
    lists: () => [...reportsKeys.all, 'list'] as const,
    list: (type?: CrimeType) => [...reportsKeys.lists(), { type }] as const,
    mine: () => [...reportsKeys.all, 'mine'] as const,
    detail: (id: string) => [...reportsKeys.all, 'detail', id] as const,
};

type ActionType = 'confirm' | 'dispute' | 'verify' | 'update' | 'delete';

interface UseCrimeReportsOptions {
    fallbackData?: VerificationCrimeReport[];
}

interface ActionState {
    id: string | null;
    type: ActionType | null;
}

export const normalizeReport = (report: CrimeReportResponse): VerificationCrimeReport => ({
    ...report,
    severityLevel: report.severityLevel ?? 'low',
    trustScore: report.trustScore ?? 0,
    verificationLevel: (report.verificationLevel as VerificationLevel) ?? VerificationLevel.UNVERIFIED,
    confirmationCount: report.confirmationCount ?? 0,
    disputeCount: report.disputeCount ?? 0,
});

export function useCrimeReports(type?: CrimeType, options: UseCrimeReportsOptions = {}) {
    const [reports, setReports] = useState<VerificationCrimeReport[]>(options.fallbackData ?? []);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionState, setActionState] = useState<ActionState>({ id: null, type: null });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.findAll(type);
            setReports(data.map(normalizeReport));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo';
            setError(message);
            if (options.fallbackData) {
                setReports(options.fallbackData);
            }
        } finally {
            setLoading(false);
        }
    }, [type, options.fallbackData]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const runAction = useCallback(
        async (id: string, action: ActionType) => {
            setActionState({ id, type: action });
            try {
                let updated: CrimeReportResponse;
                if (action === 'confirm') {
                    updated = await reportService.confirmReport(id);
                } else if (action === 'dispute') {
                    updated = await reportService.disputeReport(id);
                } else {
                    updated = await reportService.verifyReport(id);
                }

                const normalized = normalizeReport(updated);
                setReports((prev) => prev.map((report) => (report.id === id ? normalized : report)));
                return normalized;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    const confirmReport = useCallback((id: string) => runAction(id, 'confirm'), [runAction]);
    const disputeReport = useCallback((id: string) => runAction(id, 'dispute'), [runAction]);
    const verifyReport = useCallback((id: string) => runAction(id, 'verify'), [runAction]);

    const updateReport = useCallback(
        async (id: string, payload: UpdateCrimeReportDto | FormData) => {
            setActionState({ id, type: 'update' });
            try {
                const updated = await reportService.update(id, payload);
                const normalized = normalizeReport(updated);
                setReports((prev) => prev.map((report) => (report.id === id ? normalized : report)));
                return normalized;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Không thể cập nhật báo cáo';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    const deleteReport = useCallback(
        async (id: string) => {
            setActionState({ id, type: 'delete' });
            try {
                await reportService.delete(id);
                setReports((prev) => prev.filter((report) => report.id !== id));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Không thể xóa báo cáo';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    const addLocalReport = useCallback((report: VerificationCrimeReport) => {
        setReports((prev) => [report, ...prev]);
    }, []);

    const updateLocalReport = useCallback((report: VerificationCrimeReport) => {
        setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
    }, []);

    const removeLocalReport = useCallback((id: string) => {
        setReports((prev) => prev.filter((r) => r.id !== id));
    }, []);

    return {
        reports,
        loading,
        error,
        refresh: fetchReports,
        actionState,
        confirmReport,
        disputeReport,
        verifyReport,
        updateReport,
        deleteReport,
        addLocalReport,
        updateLocalReport,
        removeLocalReport,
    };
}

/**
 * Hook for fetching current user's crime reports
 * Requires authentication
 */
export function useMyReports() {
    const [reports, setReports] = useState<VerificationCrimeReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionState, setActionState] = useState<ActionState>({ id: null, type: null });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.findMine();
            setReports(data.map(normalizeReport));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const updateReport = useCallback(
        async (id: string, payload: UpdateCrimeReportDto | FormData) => {
            setActionState({ id, type: 'update' });
            try {
                const updated = await reportService.update(id, payload);
                const normalized = normalizeReport(updated);
                setReports((prev) => prev.map((report) => (report.id === id ? normalized : report)));
                return normalized;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Không thể cập nhật báo cáo';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    const deleteReport = useCallback(
        async (id: string) => {
            setActionState({ id, type: 'delete' });
            try {
                await reportService.delete(id);
                setReports((prev) => prev.filter((report) => report.id !== id));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Không thể xóa báo cáo';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    return {
        reports,
        loading,
        error,
        refresh: fetchReports,
        actionState,
        updateReport,
        deleteReport,
    };
}

// ============================================
// React Query versions (with caching)
// ============================================

/**
 * React Query hook for fetching all crime reports with caching
 * Data is shared between dashboard and reports pages
 */
export function useReportsQuery(type?: CrimeType) {
    return useQuery({
        queryKey: reportsKeys.list(type),
        queryFn: async () => {
            const data = await reportService.findAll(type);
            return data.map(normalizeReport);
        },
    });
}

/**
 * React Query hook for fetching current user's reports with caching
 */
export function useMyReportsQuery() {
    return useQuery({
        queryKey: reportsKeys.mine(),
        queryFn: async () => {
            const data = await reportService.findMine();
            return data.map(normalizeReport);
        },
    });
}

/**
 * Mutation hook for confirming a report
 */
export function useConfirmReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reportService.confirmReport(id),
        onSuccess: (data) => {
            const normalized = normalizeReport(data);
            // Update all report lists in cache
            queryClient.setQueriesData<VerificationCrimeReport[]>(
                { queryKey: reportsKeys.lists() },
                (old) => old?.map((r) => (r.id === normalized.id ? normalized : r))
            );
        },
    });
}

/**
 * Mutation hook for disputing a report
 */
export function useDisputeReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reportService.disputeReport(id),
        onSuccess: (data) => {
            const normalized = normalizeReport(data);
            queryClient.setQueriesData<VerificationCrimeReport[]>(
                { queryKey: reportsKeys.lists() },
                (old) => old?.map((r) => (r.id === normalized.id ? normalized : r))
            );
        },
    });
}

/**
 * Mutation hook for updating a report
 */
export function useUpdateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCrimeReportDto | FormData }) =>
            reportService.update(id, payload),
        onSuccess: (data) => {
            const normalized = normalizeReport(data);
            // Update all report lists
            queryClient.setQueriesData<VerificationCrimeReport[]>(
                { queryKey: reportsKeys.lists() },
                (old) => old?.map((r) => (r.id === normalized.id ? normalized : r))
            );
            // Update my reports
            queryClient.setQueryData<VerificationCrimeReport[]>(
                reportsKeys.mine(),
                (old) => old?.map((r) => (r.id === normalized.id ? normalized : r))
            );
        },
    });
}

/**
 * Mutation hook for deleting a report
 */
export function useDeleteReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reportService.delete(id),
        onSuccess: (_, id) => {
            // Remove from all report lists
            queryClient.setQueriesData<VerificationCrimeReport[]>(
                { queryKey: reportsKeys.lists() },
                (old) => old?.filter((r) => r.id !== id)
            );
            // Remove from my reports
            queryClient.setQueryData<VerificationCrimeReport[]>(
                reportsKeys.mine(),
                (old) => old?.filter((r) => r.id !== id)
            );
        },
    });
}

