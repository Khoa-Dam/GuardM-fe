import type { LeafletMap, LeafletLayerGroup, LeafletWindow } from '@/types/leaflet-manual';

import { useEffect } from 'react';
import { VerificationLevel } from '@/types/map';
import { VerificationCrimeReport } from '@/types/map';
import { CRIME_TYPE_LABEL, SEVERITY_COLOR } from '@/constants/crime-constants';

interface UseMapCrimeMarkersProps {
    isLeafletLoaded: boolean;
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    markersLayerRef: React.MutableRefObject<LeafletLayerGroup | null>;
    zonesLayerRef: React.MutableRefObject<LeafletLayerGroup | null>;
    reports: VerificationCrimeReport[];
    onMarkerClick: (reportId: string) => void;
    selectedReportId?: string | null;
}

export const useMapCrimeMarkers = ({
    isLeafletLoaded,
    mapInstanceRef,
    markersLayerRef,
    zonesLayerRef,
    reports,
    onMarkerClick,
    selectedReportId,
}: UseMapCrimeMarkersProps) => {
    useEffect(() => {
        const L = (window as unknown as LeafletWindow).L;
        if (!isLeafletLoaded || !mapInstanceRef.current || !markersLayerRef.current || !L) return;

        markersLayerRef.current.clearLayers();
        if (zonesLayerRef.current) zonesLayerRef.current.clearLayers();

        reports.forEach((report) => {
            if (!report.lat || !report.lng) return;

            const isSelected = report.id === selectedReportId;
            const color = SEVERITY_COLOR[report.severityLevel] ?? SEVERITY_COLOR.low;

            const isVerified = [VerificationLevel.VERIFIED, VerificationLevel.CONFIRMED].includes(
                report.verificationLevel ?? VerificationLevel.UNVERIFIED
            );
            const isUnverified = report.verificationLevel === VerificationLevel.UNVERIFIED;

            // ── Danger zone circle for high severity ───────────────────────
            if (report.severityLevel === 'high' && zonesLayerRef.current && L.circle) {
                const zone = L.circle([report.lat as number, report.lng as number], {
                    radius: 500,
                    color: '#ff3b3b',
                    fillColor: '#ff3b3b',
                    fillOpacity: 0.04,
                    opacity: 0.25,
                    weight: 1,
                    dashArray: '4 6',
                });
                // LeafletCircle.addTo accepts LeafletMap, cast via unknown
                (zone.addTo as unknown as (layer: LeafletLayerGroup) => void)(zonesLayerRef.current);
            }

            // ── Marker ─────────────────────────────────────────────────────
            let size = isVerified ? 22 : 16;
            if (isSelected) size = 32;

            const markerClass = isUnverified ? 'base-marker marker-unverified' : 'base-marker';
            const selectedStyle = isSelected
                ? `border: 3px solid #3b82f6; z-index: 1000; transform: scale(1.1); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), ${color.shadow};`
                : `box-shadow:${color.shadow}, 0 2px 4px rgba(0,0,0,0.2);`;

            const avatarUrl = report.reporterAvatar;
            const innerContent = avatarUrl
                ? `<img src="${avatarUrl}" alt="reporter" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`
                : `<div class="${markerClass}" style="background-color:${color.hex} !important;width:100%;height:100%;${selectedStyle}"></div>`;

            const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${isVerified || isSelected ? `<div class="pulse-ring" style="--color-rgb:${isSelected ? '59, 130, 246' : color.hex.replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(', ') ?? '0,212,255'}; width: ${size * 2}px; height: ${size * 2}px; top: -${size / 2}px; left: -${size / 2}px;"></div>` : ''}
          ${avatarUrl
                ? `<div style="width:100%;height:100%;border-radius:50%;overflow:hidden;border:2px solid ${isSelected ? '#3b82f6' : color.hex};box-shadow:${isSelected ? `0 0 0 3px rgba(59,130,246,0.4),` : ''}${color.shadow},0 2px 4px rgba(0,0,0,0.2);">${innerContent}</div>`
                : innerContent}
        </div>`;

            const marker = L.marker([report.lat, report.lng], {
                icon: L.divIcon({
                    className: isSelected ? 'custom-div-icon selected-marker-icon' : 'custom-div-icon',
                    html,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                }),
                zIndexOffset: isSelected ? 1000 : 0,
            });

            // ── Hover tooltip ─────────────────────────────────────────────
            const typeLabel = CRIME_TYPE_LABEL[report.type ?? ''] ?? (report.type ?? 'Sự cố');
            const severityLabel = report.severityLevel === 'high' ? '🔴 NGUY HIỂM' : report.severityLevel === 'medium' ? '🟡 CẢNH BÁO' : '🟢 THẤP';
            const timeStr = report.reportedAt
                ? new Date(report.reportedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : new Date(report.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

            const tooltipHtml = `
        <div style="
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          line-height: 1.5;
          min-width: 160px;
          max-width: 220px;
        ">
          <div style="font-weight:bold;color:#e0e8f0;margin-bottom:4px;font-size:11px;">${report.title || typeLabel}</div>
          <div style="color:${color.hex};margin-bottom:3px;">${severityLabel}</div>
          <div style="color:#8899aa;font-size:9px;">${typeLabel} · ${timeStr}</div>
          ${report.reporterName ? `<div style="color:#8899aa;font-size:9px;margin-top:2px;">👤 ${report.reporterName}</div>` : ''}
          <div style="color:#00d4ff;font-size:9px;margin-top:4px;border-top:1px solid rgba(0,212,255,0.15);padding-top:3px;">Click để xem chi tiết →</div>
        </div>`;

            marker.bindPopup(tooltipHtml, {
                maxWidth: 240,
                autoPan: false,
                closeButton: false,
                className: 'crime-tooltip-popup',
            });

            marker.on('mouseover', () => { marker.openPopup(); });
            marker.on('mouseout', () => { (marker as unknown as { closePopup?: () => void }).closePopup?.(); });

            marker.on('click', (e: unknown) => {
                L.DomEvent.stopPropagation(e);
                onMarkerClick(report.id);
                mapInstanceRef.current?.flyTo([report.lat as number, report.lng as number], 16, { duration: 1 });
            });

            markersLayerRef.current?.addLayer(marker);
        });
    }, [reports, isLeafletLoaded, mapInstanceRef, markersLayerRef, zonesLayerRef, onMarkerClick, selectedReportId]);
};
