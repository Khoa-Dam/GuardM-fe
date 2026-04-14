import type { LeafletMap, LeafletLayerGroup, LeafletWindow } from '@/types/leaflet-manual';
import { useEffect, useRef } from 'react';
import type { GlobalAlert } from '@/hooks/use-global-alerts';

interface UseMapGlobalAlertsProps {
    isLeafletLoaded: boolean;
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    alerts: GlobalAlert[];
    visible: boolean;
}

const severityColors: Record<string, { hex: string; glow: string }> = {
    high:   { hex: '#ff6b35', glow: 'rgba(255,107,53,0.5)' },
    medium: { hex: '#ff9a3c', glow: 'rgba(255,154,60,0.4)' },
    low:    { hex: '#ffd166', glow: 'rgba(255,209,102,0.3)' },
};

const categoryEmoji: Record<string, string> = {
    crime:    '🔴',
    disaster: '🌊',
    accident: '💥',
    conflict: '⚔️',
    health:   '🏥',
    general:  '📰',
};

const sourceLabel: Record<string, string> = {
    gdelt:          'GDELT',
    rss_vnexpress:  'VnExpress',
    rss_tuoitre:    'Tuổi Trẻ',
    rss_dantri:     'Dân Trí',
};

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

export function useMapGlobalAlerts({ isLeafletLoaded, mapInstanceRef, alerts, visible }: UseMapGlobalAlertsProps) {
    const layerRef = useRef<LeafletLayerGroup | null>(null);

    useEffect(() => {
        console.log('[useMapGlobalAlerts] effect run:', { isLeafletLoaded, hasMap: !!mapInstanceRef.current, alertsLen: alerts.length, visible });
        if (!isLeafletLoaded) return;
        const win = window as unknown as LeafletWindow;
        const L = win.L;
        if (!L || !mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Create layer once
        if (!layerRef.current) {
            layerRef.current = L.layerGroup().addTo(map);
        }

        const layer = layerRef.current;
        layer.clearLayers();

        if (!visible || alerts.length === 0) { console.log('[useMapGlobalAlerts] skipping: visible=', visible, 'alerts=', alerts.length); return; }

        for (const alert of alerts) {
            const lat = parseFloat(String(alert.lat));
            const lng = parseFloat(String(alert.lng));
            if (isNaN(lat) || isNaN(lng)) continue;

            const color = severityColors[alert.severity] ?? severityColors.low;
            const emoji = categoryEmoji[alert.category] ?? '📰';
            const isPulse = alert.severity === 'high';

            const html = `
                <div style="
                    position: relative;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    background: rgba(10,12,20,0.85);
                    border: 2px solid ${color.hex};
                    border-radius: 6px;
                    box-shadow: 0 0 8px ${color.glow}, 0 2px 6px rgba(0,0,0,0.5);
                    cursor: pointer;
                    transform: rotate(0deg);
                ">
                    ${emoji}
                    ${isPulse ? `<div style="
                        position: absolute;
                        inset: -5px;
                        border-radius: 8px;
                        border: 1.5px solid ${color.hex};
                        animation: globalPulse 1.8s ease-out infinite;
                        pointer-events: none;
                    "></div>` : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: '',
                html,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -18],
            });

            const marker = L.marker([lat, lng], { icon, zIndexOffset: 200 });

            // Tooltip on hover
            const tooltipHtml = `
                <div style="
                    font-family: monospace;
                    font-size: 11px;
                    max-width: 200px;
                    background: rgba(6,10,20,0.95);
                    border: 1px solid ${color.hex};
                    border-radius: 4px;
                    padding: 6px 8px;
                    color: #e0e8f0;
                    line-height: 1.4;
                ">
                    <div style="font-weight: bold; color: ${color.hex}; margin-bottom: 4px; font-size: 10px; text-transform: uppercase;">
                        ${sourceLabel[alert.source] ?? alert.source}
                    </div>
                    <div style="margin-bottom: 3px;">${alert.title.slice(0, 80)}${alert.title.length > 80 ? '…' : ''}</div>
                    <div style="color: #7a8fa6; font-size: 10px;">${relativeTime(alert.publishedAt)}</div>
                </div>
            `;
            marker.bindTooltip(tooltipHtml, { sticky: true, opacity: 1, className: 'global-alert-tooltip' });

            // Popup on click
            const popupHtml = `
                <div style="
                    font-family: monospace;
                    max-width: 260px;
                    background: rgba(6,10,20,0.98);
                    color: #e0e8f0;
                    padding: 10px 12px;
                    border-radius: 6px;
                    border-top: 3px solid ${color.hex};
                ">
                    <div style="font-size: 10px; color: ${color.hex}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
                        ${emoji} ${sourceLabel[alert.source] ?? alert.source} · ${alert.category}
                    </div>
                    <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; line-height: 1.4;">
                        ${alert.title}
                    </div>
                    ${alert.summary ? `<div style="font-size: 11px; color: #8899aa; margin-bottom: 8px; line-height: 1.5;">${alert.summary.slice(0, 200)}…</div>` : ''}
                    <div style="font-size: 10px; color: #7a8fa6; margin-bottom: 8px;">${relativeTime(alert.publishedAt)} · ${alert.locationName ?? ''}</div>
                    ${alert.url ? `<a href="${alert.url}" target="_blank" rel="noopener noreferrer" style="
                        display: inline-block;
                        font-size: 11px;
                        color: ${color.hex};
                        text-decoration: none;
                        border: 1px solid ${color.hex};
                        border-radius: 3px;
                        padding: 3px 8px;
                    ">📰 Xem bài viết →</a>` : ''}
                </div>
            `;
            marker.bindPopup(popupHtml, { maxWidth: 280, className: 'global-alert-popup' });

            layer.addLayer(marker);
        }
        console.log('[useMapGlobalAlerts] added markers to layer');
    }, [isLeafletLoaded, mapInstanceRef, alerts, visible]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            layerRef.current?.clearLayers();
        };
    }, []);

    return { layerRef };
}
