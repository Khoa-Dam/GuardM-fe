'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { LeafletMap } from '@/types/leaflet-manual';
import { useDeleteReport, useConfirmReport, useDisputeReport } from '@/hooks/use-crime-reports';
import type { VerificationCrimeReport } from '@/types/map';

interface UseMapActionsProps {
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    reports: VerificationCrimeReport[];
    loading: boolean;
    isLeafletLoaded: boolean;
    onEditReport: (report: VerificationCrimeReport) => void;
}

export function useMapActions({ mapInstanceRef, reports, loading, isLeafletLoaded, onEditReport }: UseMapActionsProps) {
    const searchParams = useSearchParams();
    const hasHandledQueryParams = useRef<string>('');

    const [selectedReportId, setSelectedReportId]   = useState<string | null>(null);
    const [actionState, setActionState]             = useState<{ id: string | null; type: string | null }>({ id: null, type: null });

    const deleteReportMutation  = useDeleteReport();
    const confirmReportMutation = useConfirmReport();
    const disputeReportMutation = useDisputeReport();

    // Handle ?focus= and ?edit= query params
    useEffect(() => {
        if (loading || !reports.length || !isLeafletLoaded) return;
        const focusId = searchParams.get('focus');
        const editId  = searchParams.get('edit');
        const currentParams = searchParams.toString();
        if (hasHandledQueryParams.current === currentParams) return;

        const map = mapInstanceRef.current;
        if (focusId) {
            const report = reports.find(r => r.id === focusId);
            if (report?.lat && report.lng) {
                setSelectedReportId(focusId);
                map?.flyTo([report.lat, report.lng], 16, { duration: 1.5 });
            } else if (report) {
                setSelectedReportId(focusId);
            }
        } else if (editId) {
            const report = reports.find(r => r.id === editId);
            if (report) onEditReport(report);
        }
        hasHandledQueryParams.current = currentParams;
    }, [searchParams, reports, loading, isLeafletLoaded, mapInstanceRef, onEditReport]);

    const handleConfirm = useCallback(async (id: string) => {
        setActionState({ id, type: 'confirm' });
        try {
            await confirmReportMutation.mutateAsync(id);
            toast.success('Đã xác nhận (+5 điểm tin cậy)');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Lỗi');
        } finally {
            setActionState({ id: null, type: null });
        }
    }, [confirmReportMutation]);

    const handleDispute = useCallback(async (id: string) => {
        setActionState({ id, type: 'dispute' });
        try {
            await disputeReportMutation.mutateAsync(id);
            toast.error('Đã báo cáo sai lệch (-10 điểm)');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Lỗi');
        } finally {
            setActionState({ id: null, type: null });
        }
    }, [disputeReportMutation]);

    const handleDeleteReport = useCallback(async (id: string) => {
        try {
            await deleteReportMutation.mutateAsync(id);
            toast.success('Đã xóa báo cáo');
            if (selectedReportId === id) setSelectedReportId(null);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể xóa');
        }
    }, [deleteReportMutation, selectedReportId]);

    return {
        selectedReportId, setSelectedReportId,
        actionState,
        handleConfirm,
        handleDispute,
        handleDeleteReport,
    };
}
