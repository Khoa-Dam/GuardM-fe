import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportService, { CrimeReportResponse, CrimeType, CreateCrimeReportDto, UpdateCrimeReportDto } from '@/service/report.service';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';
import { statisticsKeys } from './use-statistics';

// Query keys for cache management
export const reportsKeys = {
    all: ['reports'] as const,
    lists: () => [...reportsKeys.all, 'list'] as const,
    list: (type?: CrimeType) => [...reportsKeys.lists(), { type }] as const,
    mine: () => [...reportsKeys.all, 'mine'] as const,
    detail: (id: string) => [...reportsKeys.all, 'detail', id] as const,
};

export const normalizeReport = (report: CrimeReportResponse): VerificationCrimeReport => ({
    ...report,
    severityLevel: report.severityLevel ?? 'low',
    trustScore: report.trustScore ?? 0,
    verificationLevel: (report.verificationLevel as VerificationLevel) ?? VerificationLevel.UNVERIFIED,
    confirmationCount: report.confirmationCount ?? 0,
    disputeCount: report.disputeCount ?? 0,
});

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
 * Mutation hook for creating a report
 */
export function useCreateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCrimeReportDto) => reportService.create(payload),
        onSuccess: (data) => {
            const normalized = normalizeReport(data);
            // Update all report lists
            queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
            // Update my reports
            queryClient.invalidateQueries({ queryKey: reportsKeys.mine() });
            // Invalidate statistics to update total count
            queryClient.invalidateQueries({ queryKey: statisticsKeys.statistics() });
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
            // Invalidate statistics (in case severity changed)
            queryClient.invalidateQueries({ queryKey: statisticsKeys.statistics() });
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
            // Invalidate statistics to update total count
            queryClient.invalidateQueries({ queryKey: statisticsKeys.statistics() });
        },
    });
}

/**
 * Mutation hook for admin verifying a report (Admin only)
 */
export function useAdminVerifyReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reportService.verifyReport(id),
        onSuccess: (data) => {
            const normalized = normalizeReport(data);
            // Update all report lists
            queryClient.setQueriesData<VerificationCrimeReport[]>(
                { queryKey: reportsKeys.lists() },
                (old) => old?.map((r) => (r.id === normalized.id ? normalized : r))
            );
        },
    });
}
