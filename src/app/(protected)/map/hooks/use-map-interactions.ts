'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { LeafletMap, LeafletWindow } from '@/types/leaflet-manual';
import { reverseGeocode } from '@/utils/geocoding';
import type { ReportLocationData, ReportFormPayload } from '../components/ReportForm';
import {
    useCreateReport, useUpdateReport,
    useDeleteReport, useConfirmReport, useDisputeReport,
} from '@/hooks/use-crime-reports';
import type { VerificationCrimeReport } from '@/types/map';

interface UseMapInteractionsProps {
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    isLeafletLoaded: boolean;
    reports: VerificationCrimeReport[];
    loading: boolean;
}

/**
 * Merges useReportingMode + useMapActions into one hook.
 *
 * Previously these two hooks had a circular dependency:
 *   - useReportingMode needed actions.setSelectedReportId (to close a card when editing starts)
 *   - useMapActions needed reporting.handleEditReport (to open the edit form from a URL param)
 * The page worked around this with refs. Having them in the same scope removes the indirection.
 */
export function useMapInteractions({ mapInstanceRef, isLeafletLoaded, reports, loading }: UseMapInteractionsProps) {
    const router       = useRouter();
    const searchParams = useSearchParams();

    // ── Reporting mode state ─────────────────────────────────────────────────
    const [isReportingMode, setIsReportingMode]   = useState(false);
    const [showReportForm, setShowReportForm]     = useState(false);
    const [reportLocation, setReportLocation]     = useState<ReportLocationData | null>(null);
    const [editingReportId, setEditingReportId]   = useState<string | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [liveCoords, setLiveCoords]             = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting]         = useState(false);

    // ── Selection + action state ─────────────────────────────────────────────
    const [selectedReportId, setSelectedReportId]   = useState<string | null>(null);
    const [actionState, setActionState]             = useState<{ id: string | null; type: string | null }>({ id: null, type: null });

    // ── Mutations ────────────────────────────────────────────────────────────
    const createReportMutation  = useCreateReport();
    const updateReportMutation  = useUpdateReport();
    const deleteReportMutation  = useDeleteReport();
    const confirmReportMutation = useConfirmReport();
    const disputeReportMutation = useDisputeReport();

    const hasHandledQueryParams = useRef<string>('');

    // ── Address resolution while in crosshair mode ───────────────────────────
    useEffect(() => {
        if (!isReportingMode || showReportForm) {
            setLiveCoords(null);
            return;
        }
        const L = (window as unknown as LeafletWindow).L;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        let isMounted = true;

        const updateLocation = async () => {
            const center = map.getCenter();
            const { lat, lng } = center;
            setLiveCoords({ lat, lng });
            setIsLoadingAddress(true);
            const data = await reverseGeocode(lat, lng);
            if (!isMounted) return;
            setIsLoadingAddress(false);
            setReportLocation({
                lat, lng,
                address: data?.display_name || 'Không xác định được địa chỉ',
                addressDetails: data?.address,
            });
        };

        const onMove    = () => { const c = map.getCenter(); setLiveCoords({ lat: c.lat, lng: c.lng }); setIsLoadingAddress(true); };
        const onMoveEnd = () => updateLocation();

        map.on('move', onMove);
        map.on('moveend', onMoveEnd);
        updateLocation();

        return () => {
            isMounted = false;
            map.off('move', onMove);
            map.off('moveend', onMoveEnd);
        };
    }, [isReportingMode, showReportForm, isLeafletLoaded, mapInstanceRef]);

    // ── Handle ?focus= and ?edit= URL params ─────────────────────────────────
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
            if (report) handleEditReport(report);
        }
        hasHandledQueryParams.current = currentParams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, reports, loading, isLeafletLoaded, mapInstanceRef]);

    // ── Reporting actions ────────────────────────────────────────────────────

    const handleEditReport = useCallback((report: VerificationCrimeReport) => {
        setSelectedReportId(null);          // close ReportCard
        setEditingReportId(report.id);
        if (report.lat && report.lng) {
            setReportLocation({
                lat: Number(report.lat), lng: Number(report.lng),
                address: report.address || '',
                addressDetails: {
                    city: report.district || '', city_district: report.ward || '',
                    province: report.province || '', road: report.street || '',
                },
            });
            setIsReportingMode(true);
            setShowReportForm(true);
        } else {
            toast.error('Báo cáo không có thông tin vị trí');
        }
    }, []);

    const handleConfirmLocation = useCallback(() => {
        if (!reportLocation || isLoadingAddress) {
            toast.warning('Đang lấy vị trí, vui lòng đợi...');
            return;
        }
        setShowReportForm(true);
    }, [reportLocation, isLoadingAddress]);

    const handleCancelReporting = useCallback(() => {
        setIsReportingMode(false);
        setShowReportForm(false);
        setReportLocation(null);
        setEditingReportId(null);
        router.replace('/map');
    }, [router]);

    const handleReportSubmit = useCallback(async (data: ReportFormPayload) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, reportedAt: data.reportedAt ? new Date(data.reportedAt) : undefined };
            if (editingReportId) {
                await updateReportMutation.mutateAsync({ id: editingReportId, payload });
                toast.success('Đã cập nhật báo cáo');
            } else {
                const created = await createReportMutation.mutateAsync(payload);
                toast.success('Đã gửi báo cáo!');
                setSelectedReportId(created.id);
            }
            setShowReportForm(false);
            setIsReportingMode(false);
            setReportLocation(null);
            setEditingReportId(null);
            router.replace('/map');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể xử lý báo cáo');
        } finally {
            setIsSubmitting(false);
        }
    }, [editingReportId, createReportMutation, updateReportMutation, router]);

    // ── Vote / delete actions ────────────────────────────────────────────────

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

    // ── Derived ──────────────────────────────────────────────────────────────
    const selectedReport = reports.find(r => r.id === selectedReportId) ?? null;

    return {
        // Reporting
        isReportingMode, setIsReportingMode,
        showReportForm, setShowReportForm,
        reportLocation,
        editingReportId, setEditingReportId,
        isLoadingAddress,
        liveCoords,
        isSubmitting,
        handleReportSubmit,
        handleCancelReporting,
        handleEditReport,
        handleConfirmLocation,
        // Selection
        selectedReportId, setSelectedReportId,
        selectedReport,
        // Actions
        actionState,
        handleConfirm,
        handleDispute,
        handleDeleteReport,
    };
}
