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

const severityColorMap: Record<string, { hex: string; rgb: string }> = {
    low: { hex: '#22c55e', rgb: '34, 197, 94' },
    medium: { hex: '#f59e0b', rgb: '245, 158, 11' },
    high: { hex: '#ef4444', rgb: '239, 68, 68' },
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

            const severity = severityColorMap[report.severityLevel] ?? severityColorMap.low;
            const isVerified = [VerificationLevel.VERIFIED, VerificationLevel.CONFIRMED].includes(
                report.verificationLevel
            );
            const isUnverified = report.verificationLevel === VerificationLevel.UNVERIFIED;

            const size = isVerified ? 20 : 14;
            const markerClass = isUnverified ? 'base-marker marker-unverified' : 'base-marker';
            const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${isVerified ? `<div class="pulse-ring" style="--color-rgb:${severity.rgb}"></div>` : ''}
          <div class="${markerClass}" style="background-color:${severity.hex};width:100%;height:100%;"></div>
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

