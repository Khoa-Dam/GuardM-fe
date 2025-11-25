'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLeaflet } from '@/hooks/use-leaflet';
import { useCrimeReports } from '@/hooks/use-crime-reports';
import ReportCard from './components/ReportCard';
import { FilterBtn, DangerAlert, SearchBox, ReportForm } from './components';
import { SAMPLE_DATA } from './mock-data';
import { FilterType, VerificationCrimeReport, VerificationLevel } from '@/types/map';
import { useMapInit, useMapGeolocation, useMapCrimeMarkers } from './hooks';
import { reverseGeocode } from '@/utils/geocoding';
import type { ReportLocationData, ReportFormPayload } from './components/ReportForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import reportService from '@/service/report.service';

const CrimeMap = () => {
    const reportMarkerRef = useRef<any>(null);

    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [isReportingMode, setIsReportingMode] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportLocation, setReportLocation] = useState<ReportLocationData | null>(null);

    const isLeafletLoaded = useLeaflet();
    const { reports, loading, error, actionState, confirmReport, disputeReport, addLocalReport } = useCrimeReports(undefined, {
        fallbackData: SAMPLE_DATA,
    });

    // Khởi tạo map
    const { mapContainerRef, mapInstanceRef, markersLayerRef } = useMapInit(isLeafletLoaded);

    // Quản lý geolocation và cảnh báo nguy hiểm
    const { handleGetLocation, alertMessage, setAlertMessage, currentLocation } = useMapGeolocation({
        isLeafletLoaded,
        mapInstanceRef,
        reports,
    });

    // Lọc reports theo filter
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (filter === 'all') return true;
            return report.severityLevel === filter;
        });
    }, [reports, filter]);

    // Render crime markers trên map
    useMapCrimeMarkers({
        isLeafletLoaded,
        mapInstanceRef,
        markersLayerRef,
        reports: isReportingMode ? [] : filteredReports,
        onMarkerClick: (reportId) => setSelectedReportId(reportId),
    });

    // Xử lý click trên map để đóng report card
    useEffect(() => {
        const map = mapInstanceRef.current;
        const L = (window as any).L;
        if (!map || !L) return;
        const handler = () => setSelectedReportId(null);
        map.on('click', handler);
        return () => {
            map.off('click', handler);
        };
    }, [mapInstanceRef]);

    // Xử lý lỗi
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Handle reporting marker
    useEffect(() => {
        if (!isReportingMode || showReportForm) {
            if (reportMarkerRef.current && mapInstanceRef.current) {
                const map = mapInstanceRef.current;
                map.removeLayer(reportMarkerRef.current);
                reportMarkerRef.current = null;
            }
            if (!showReportForm) {
                setReportLocation(null);
            }
            return;
        }

        const L = (window as any).L;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        const markerIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        const center = map.getCenter();
        const marker = L.marker([center.lat, center.lng], {
            draggable: false,
            icon: markerIcon,
            zIndexOffset: 1000,
        }).addTo(map);
        reportMarkerRef.current = marker;

        let isMounted = true;
        const updateLocation = async () => {
            const center = map.getCenter();
            marker.setLatLng(center);

            const { lat, lng } = center;
            const data = await reverseGeocode(lat, lng);
            if (!isMounted) return;
            setReportLocation({
                lat,
                lng,
                address: data?.display_name || 'Đang xác định...',
                addressDetails: data?.address,
            });
            marker.bindPopup(`<b>Vị trí đã chọn:</b><br/>${data?.display_name || 'Đang tải...'}`, { autoPan: false }).openPopup();
        };

        // Update marker position immediately on move
        const onMove = () => {
            marker.setLatLng(map.getCenter());
        };

        // Update address only on moveend to save API calls
        map.on('move', onMove);
        map.on('moveend', updateLocation);

        updateLocation();

        return () => {
            isMounted = false;
            map.off('move', onMove);
            map.off('moveend', updateLocation);
            map.removeLayer(marker);
            reportMarkerRef.current = null;
        };
    }, [isReportingMode, showReportForm, isLeafletLoaded]);

    const handleSelectSearchLocation = async (lat: number, lng: number, address: string) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.flyTo([lat, lng], 16, { duration: 1.5 });
    };

    const updateReportMarkerLocation = async (latitude: number, longitude: number) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.flyTo([latitude, longitude], 16, { duration: 1.5 });
    };

    const handleLocationButtonClick = () => {
        handleGetLocation();

        if (isReportingMode && !showReportForm) {
            if (currentLocation) {
                updateReportMarkerLocation(currentLocation.lat, currentLocation.lng);
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => updateReportMarkerLocation(coords.latitude, coords.longitude),
                    () => toast.error('Không thể xác định vị trí hiện tại của bạn')
                );
            }
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReportSubmit = async (data: ReportFormPayload) => {
        setIsSubmitting(true);
        try {
            const created = await reportService.create({
                title: data.title,
                description: data.description,
                type: data.type,
                lat: data.lat,
                lng: data.lng,
                address: data.address,
                areaCode: data.areaCode,
                province: data.province,
                district: data.district,
                ward: data.ward,
                street: data.street,
                source: data.source,
                severity: data.severity,
                reportedAt: data.reportedAt ? new Date(data.reportedAt) : undefined,
                attachments: data.attachments,
            });

            // Normalize response to VerificationCrimeReport
            const severityValue = created.severity ?? 3;
            let severityLevel: 'low' | 'medium' | 'high' = 'low';
            if (severityValue >= 5) severityLevel = 'high';
            else if (severityValue >= 3) severityLevel = 'medium';

            const newReport: VerificationCrimeReport = {
                id: created.id,
                title: created.title || data.title,
                description: created.description || data.description,
                type: created.type || data.type,
                lat: created.lat || data.lat,
                lng: created.lng || data.lng,
                address: created.address || data.address,
                province: created.province || data.province,
                district: created.district || data.district,
                ward: created.ward,
                street: created.street,
                areaCode: created.areaCode,
                source: created.source,
                status: created.status,
                severity: created.severity,
                severityLevel: created.severityLevel || severityLevel,
                trustScore: created.trustScore ?? 0,
                verificationLevel: (created.verificationLevel as VerificationLevel) || VerificationLevel.UNVERIFIED,
                confirmationCount: created.confirmationCount ?? 0,
                disputeCount: created.disputeCount ?? 0,
                attachments: created.attachments,
                reportedAt: created.reportedAt?.toString(),
                createdAt: created.createdAt.toString(),
                updatedAt: created.updatedAt.toString(),
                reporterId: created.reporterId || '',
            };

            addLocalReport(newReport);
            toast.success('Đã gửi báo cáo thành công!');
            setShowReportForm(false);
            setIsReportingMode(false);
            setReportLocation(null);
            setSelectedReportId(newReport.id);
        } catch (err: any) {
            console.error('Create report error:', err);
            toast.error(err?.message || 'Gửi báo cáo thất bại, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelReporting = () => {
        setIsReportingMode(false);
        setShowReportForm(false);
        setReportLocation(null);
    };

    const handleConfirm = async (id: string) => {
        try {
            await confirmReport(id);
            toast.success('Đã gửi xác nhận (+5 điểm tin cậy)');
        } catch (err: any) {
            toast.error(err?.message || 'Không thể xác nhận báo cáo');
        }
    };

    const handleDispute = async (id: string) => {
        try {
            await disputeReport(id);
            toast.error('Đã báo cáo sai lệch (-10 điểm tin cậy)');
        } catch (err: any) {
            toast.error(err?.message || 'Không thể báo cáo sai lệch');
        }
    };

    const selectedReport = reports.find((r) => r.id === selectedReportId);

    return (
        <div className="relative w-full h-[65vh] md:h-[600px] rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white font-sans">
            {alertMessage && (
                <DangerAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
            {(!isLeafletLoaded || loading) && (
                <div className="absolute inset-0 bg-white/90 z-2000 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-top-transparent rounded-full animate-spin mb-3" />
                    <span className="text-sm font-semibold text-gray-600">Đang tải bản đồ...</span>
                </div>
            )}

            <div className="absolute top-4 left-4 right-4 z-45 flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x pointer-events-none">
                {!isReportingMode ? (
                    <>
                        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                            Tất cả
                        </FilterBtn>
                        <FilterBtn active={filter === 'high'} onClick={() => setFilter('high')}>
                            Nguy hiểm cao
                        </FilterBtn>
                        <FilterBtn active={filter === 'medium'} onClick={() => setFilter('medium')}>
                            Trung bình
                        </FilterBtn>
                        <FilterBtn active={filter === 'low'} onClick={() => setFilter('low')}>
                            Thấp
                        </FilterBtn>
                    </>
                ) : (
                    <Badge variant="secondary" className="mx-auto bg-black/70 text-white border-0 pointer-events-auto">
                        Kéo ghim hoặc tìm kiếm để chọn vị trí chính xác
                    </Badge>
                )}
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-50" />

            {isReportingMode && !showReportForm && (
                <>
                    <SearchBox onSelectLocation={handleSelectSearchLocation} />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-1000 flex gap-3 w-full max-w-xs px-4 pointer-events-auto">
                        <Button
                            variant="outline"
                            onClick={handleCancelReporting}
                            className="flex-1 shadow-lg"
                            size="lg"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => {
                                if (!reportLocation) {
                                    toast.warning('Đang lấy vị trí, vui lòng đợi...');
                                    return;
                                }
                                setShowReportForm(true);
                            }}
                            className="flex-1 shadow-lg"
                            size="lg"
                            disabled={!reportLocation}
                        >
                            Tiếp tục
                        </Button>
                    </div>
                </>
            )}

            <Button
                onClick={() => setIsReportingMode(true)}
                className="absolute bottom-4 left-4 z-900 rounded-full shadow-lg pointer-events-auto bg-red-600 hover:bg-red-700"
                size="lg"
                disabled={isReportingMode}
            >
                <Plus className="h-5 w-5 mr-2" />
                Báo cáo ngay
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={handleLocationButtonClick}
                className="absolute bottom-5 right-15 z-950 rounded-full shadow-lg pointer-events-auto h-12 w-12 group bg-white hover:bg-blue-50 hover:border-blue-300 transition-all"
                title="Vị trí của tôi"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                    className="text-blue-600 group-hover:text-blue-700 transition-colors" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                </svg>
            </Button>

            {showReportForm && reportLocation && (
                <ReportForm
                    locationData={reportLocation}
                    onClose={() => setShowReportForm(false)}
                    onSubmit={handleReportSubmit}
                    isSubmitting={isSubmitting}
                />
            )}

            {selectedReport && (
                <ReportCard
                    report={selectedReport}
                    onClose={() => setSelectedReportId(null)}
                    onConfirm={handleConfirm}
                    onDispute={handleDispute}
                    isConfirming={actionState.id === selectedReport.id && actionState.type === 'confirm'}
                    isDisputing={actionState.id === selectedReport.id && actionState.type === 'dispute'}
                />
            )}
        </div>
    );
};

export default CrimeMap;

