'use client';

import { useEffect } from 'react';
import { VerificationLevel } from '@/types/map';
import { VerificationCrimeReport } from '@/types/map';

interface UseMapCrimeMarkersProps {
    isLeafletLoaded: boolean;
    mapInstanceRef: React.MutableRefObject<any>;
    markersLayerRef: React.MutableRefObject<any>;
    reports: VerificationCrimeReport[];
    onMarkerClick: (reportId: string) => void;
}

// Màu marker dựa trên mức độ nghiêm trọng (severityLevel)
const severityColorMap: Record<string, { hex: string; rgb: string; shadow: string }> = {
    low: { hex: '#56a381', rgb: '86, 163, 129', shadow: '0 0 0 2px rgba(86, 163, 129, 0.3)' },      // Xanh - Nguy hiểm thấp
    medium: { hex: '#fcf160', rgb: '252, 241, 96', shadow: '0 0 0 2px rgba(252, 241, 96, 0.3)' },  // Vàng - Nguy hiểm trung bình
    high: { hex: '#dd3121', rgb: '221, 49, 33', shadow: '0 0 0 2px rgba(221, 49, 33, 0.3)' },     // Đỏ - Nguy hiểm cao
};

export const useMapCrimeMarkers = ({
    isLeafletLoaded,
    mapInstanceRef,
    markersLayerRef,
    reports,
    onMarkerClick,
}: UseMapCrimeMarkersProps) => {
    useEffect(() => {
        const L = (window as any).L;
        if (!isLeafletLoaded || !mapInstanceRef.current || !markersLayerRef.current || !L) return;

        markersLayerRef.current.clearLayers();

        reports.forEach((report) => {
            if (!report.lat || !report.lng) return;

            // Màu marker được quyết định bởi mức độ nghiêm trọng (severityLevel)
            const color = severityColorMap[report.severityLevel] ?? severityColorMap.low;

            const isVerified = [VerificationLevel.VERIFIED, VerificationLevel.CONFIRMED].includes(
                report.verificationLevel ?? VerificationLevel.UNVERIFIED
            );
            const isUnverified = report.verificationLevel === VerificationLevel.UNVERIFIED;

            const size = isVerified ? 22 : 16; // Tăng size để rõ hơn
            const markerClass = isUnverified ? 'base-marker marker-unverified' : 'base-marker';
            const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${isVerified ? `<div class="pulse-ring" style="--color-rgb:${color.rgb}"></div>` : ''}
          <div class="${markerClass}" style="background-color:${color.hex} !important;width:100%;height:100%;box-shadow:${color.shadow}, 0 2px 4px rgba(0,0,0,0.2);"></div>
        </div>`;

            const marker = L.marker([report.lat, report.lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                }),
            });

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                onMarkerClick(report.id);
                mapInstanceRef.current.flyTo([report.lat, report.lng], 15, { duration: 1 });
            });

            markersLayerRef.current.addLayer(marker);
        });
    }, [reports, isLeafletLoaded, mapInstanceRef, markersLayerRef, onMarkerClick]);
};

