'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CrimeType } from '@/service/report.service';
import { useLeaflet } from '@/hooks/use-leaflet';
import { useCrimeReports } from '@/hooks/use-crime-reports';
import ReportCard from './components/ReportCard';
import { FilterBtn } from './components';
import { SAMPLE_DATA } from './mock-data';
import { FilterType, VerificationLevel } from '@/types/map';

const severityColorMap: Record<string, { hex: string; rgb: string }> = {
    low: { hex: '#22c55e', rgb: '34, 197, 94' },
    medium: { hex: '#f59e0b', rgb: '245, 158, 11' },
    high: { hex: '#ef4444', rgb: '239, 68, 68' },
};

const typeFilterMap: Partial<Record<FilterType, CrimeType>> = {
    cuop_giat: CrimeType.CuopGiat,
    trom_cap: CrimeType.TromCap,
};

const CrimeMap = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);

    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [hasLocated, setHasLocated] = useState(false);

    const isLeafletLoaded = useLeaflet();
    const typeFilter = typeFilterMap[filter];
    const { reports, loading, error, actionState, confirmReport, disputeReport } = useCrimeReports(typeFilter, {
        fallbackData: SAMPLE_DATA,
    });

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (!isLeafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

        try {
            const L = (window as any).L;
            if (!L || typeof L.map !== 'function') return;

            const map = L.map(mapContainerRef.current, { zoomControl: false, tap: true }).setView([10.7769, 106.7009], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);
            map.on('click', () => setSelectedReportId(null));

            mapInstanceRef.current = map;
            markersLayerRef.current = markersLayer;
        } catch (error) {
            console.error('Map Init Error:', error);
        }
    }, [isLeafletLoaded]);

    const handleGetLocation = () => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.warning('Trình duyệt không hỗ trợ định vị');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const map = mapInstanceRef.current;
                const L = (window as any).L;
                if (!map || !L) return;

                if (userMarkerRef.current) {
                    map.removeLayer(userMarkerRef.current);
                }

                const icon = L.divIcon({
                    className: 'custom-user-marker',
                    html: `<div class="my-location-pulse" style="width:16px;height:16px;"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                });
                const marker = L.marker([coords.latitude, coords.longitude], { icon: icon }).addTo(map);
                marker.bindPopup('<b>Vị trí hiện tại của bạn</b>');

                userMarkerRef.current = marker;
                map.flyTo([coords.latitude, coords.longitude], 15, { duration: 1.1 });
                setHasLocated(true);
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                toast.error('Không thể xác định vị trí của bạn');
            }
        );
    };

    useEffect(() => {
        if (isLeafletLoaded && mapInstanceRef.current && !hasLocated) {
            handleGetLocation();
        }
    }, [isLeafletLoaded, hasLocated]);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (filter === 'all') return true;
            if (filter === 'high_severity') return report.severityLevel === 'high';
            return report.type === filter;
        });
    }, [reports, filter]);

    useEffect(() => {
        const L = (window as any).L;
        if (!isLeafletLoaded || !mapInstanceRef.current || !markersLayerRef.current || !L) return;

        markersLayerRef.current.clearLayers();

        filteredReports.forEach((report) => {
            if (!report.lat || !report.lng) return;

            const severity = severityColorMap[report.severityLevel] ?? severityColorMap.low;
            const isVerified = [VerificationLevel.VERIFIED, VerificationLevel.CONFIRMED].includes(report.verificationLevel);
            const isUnverified = report.verificationLevel === VerificationLevel.UNVERIFIED;

            const size = isVerified ? 20 : 14;
            const markerClass = isUnverified ? 'base-marker marker-unverified' : 'base-marker';
            const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${isVerified ? `<div class="pulse-ring" style="--color-rgb:${severity.rgb}"></div>` : ''}
          <div class="${markerClass}" style="background-color:${severity.hex};width:100%;height:100%;"></div>
        </div>`;

            const marker = L.marker([report.lat, report.lng], {
                icon: L.divIcon({ className: 'custom-div-icon', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
            });

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                setSelectedReportId(report.id);
                mapInstanceRef.current.flyTo([report.lat, report.lng], 15, { duration: 1 });
            });

            markersLayerRef.current.addLayer(marker);
        });
    }, [filteredReports, isLeafletLoaded]);

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
            {(!isLeafletLoaded || loading) && (
                <div className="absolute inset-0 bg-white/90 z-2000 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-top-transparent rounded-full animate-spin mb-3" />
                    <span className="text-sm font-semibold text-gray-600">Đang tải bản đồ...</span>
                </div>
            )}

            <div className="absolute top-4 left-4 right-4 z-900 flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x pointer-events-none">
                <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                    Tất cả
                </FilterBtn>
                <FilterBtn active={filter === 'high_severity'} onClick={() => setFilter('high_severity')}>
                    Nguy hiểm cao
                </FilterBtn>
                <FilterBtn active={filter === 'cuop_giat'} onClick={() => setFilter('cuop_giat')}>
                    Cướp giật
                </FilterBtn>
                <FilterBtn active={filter === 'trom_cap'} onClick={() => setFilter('trom_cap')}>
                    Trộm cắp
                </FilterBtn>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-50" />

            <button
                onClick={handleGetLocation}
                className="absolute bottom-5 right-15 z-950 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 text-blue-600 border border-gray-100 flex items-center justify-center"
                title="Vị trí của tôi"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                </svg>
            </button>

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

