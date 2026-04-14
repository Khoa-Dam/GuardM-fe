'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LeafletMap, LeafletWindow } from '@/types/leaflet-manual';
import { reverseGeocode } from '@/utils/geocoding';
import type { ReportLocationData, ReportFormPayload } from '../components/ReportForm';
import { useCreateReport, useUpdateReport } from '@/hooks/use-crime-reports';
import type { VerificationCrimeReport } from '@/types/map';

interface UseReportingModeProps {
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    isLeafletLoaded: boolean;
    reports: VerificationCrimeReport[];
    onSelectReport: (id: string | null) => void;
}

export function useReportingMode({ mapInstanceRef, isLeafletLoaded, reports, onSelectReport }: UseReportingModeProps) {
    const router = useRouter();
    const [isReportingMode, setIsReportingMode]   = useState(false);
    const [showReportForm, setShowReportForm]     = useState(false);
    const [reportLocation, setReportLocation]     = useState<ReportLocationData | null>(null);
    const [editingReportId, setEditingReportId]   = useState<string | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [liveCoords, setLiveCoords]             = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting]         = useState(false);

    const createReportMutation = useCreateReport();
    const updateReportMutation = useUpdateReport();

    // HUD + address resolution while in reporting mode (map crosshair mode)
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

        const onMove = () => {
            const center = map.getCenter();
            setLiveCoords({ lat: center.lat, lng: center.lng });
            setIsLoadingAddress(true);
        };

        map.on('move', onMove);
        map.on('moveend', updateLocation);
        updateLocation();

        return () => {
            isMounted = false;
            map.off('move', onMove);
            map.off('moveend', updateLocation);
        };
    }, [isReportingMode, showReportForm, isLeafletLoaded, mapInstanceRef]);

    const handleReportSubmit = useCallback(async (data: ReportFormPayload) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                reportedAt: data.reportedAt ? new Date(data.reportedAt) : undefined,
            };
            if (editingReportId) {
                await updateReportMutation.mutateAsync({ id: editingReportId, payload });
                toast.success('Đã cập nhật báo cáo');
            } else {
                const created = await createReportMutation.mutateAsync(payload);
                toast.success('Đã gửi báo cáo!');
                onSelectReport(created.id);
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
    }, [editingReportId, createReportMutation, updateReportMutation, onSelectReport, router]);

    const handleCancelReporting = useCallback(() => {
        setIsReportingMode(false);
        setShowReportForm(false);
        setReportLocation(null);
        setEditingReportId(null);
        router.replace('/map');
    }, [router]);

    const handleEditReport = useCallback((report: VerificationCrimeReport) => {
        setEditingReportId(report.id);
        onSelectReport(null);
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
    }, [onSelectReport]);

    const handleConfirmLocation = useCallback(() => {
        if (!reportLocation || isLoadingAddress) {
            toast.warning('Đang lấy vị trí, vui lòng đợi...');
            return;
        }
        setShowReportForm(true);
    }, [reportLocation, isLoadingAddress]);

    return {
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
    };
}
