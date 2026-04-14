import type { LeafletMap, LeafletHeatLayer, LeafletWindow } from '@/types/leaflet-manual';
import { useEffect, useRef } from 'react';
import type { VerificationCrimeReport } from '@/types/map';

interface UseMapHeatmapProps {
    isLeafletLoaded: boolean;
    mapInstanceRef: React.MutableRefObject<LeafletMap | null>;
    reports: VerificationCrimeReport[];
    enabled: boolean;
}

export const useMapHeatmap = ({
    isLeafletLoaded,
    mapInstanceRef,
    reports,
    enabled,
}: UseMapHeatmapProps) => {
    const heatLayerRef = useRef<LeafletHeatLayer | null>(null);

    useEffect(() => {
        const L = (window as unknown as LeafletWindow).L;
        if (!isLeafletLoaded || !mapInstanceRef.current || !L) return;

        // Remove existing heat layer
        if (heatLayerRef.current) {
            heatLayerRef.current.remove();
            heatLayerRef.current = null;
        }

        if (!enabled || !L.heatLayer) return;

        const points = reports
            .filter(r => r.lat && r.lng)
            .map(r => [
                r.lat as number,
                r.lng as number,
                r.severityLevel === 'high' ? 1.0 : r.severityLevel === 'medium' ? 0.6 : 0.3,
            ] as [number, number, number]);

        if (!points.length) return;

        const heat = L.heatLayer(points, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            max: 1.0,
            gradient: { 0.3: '#00ff88', 0.55: '#ffd700', 0.75: '#ff6b35', 1.0: '#ff3b3b' },
        });

        heat.addTo(mapInstanceRef.current);
        heatLayerRef.current = heat;

        return () => {
            heatLayerRef.current?.remove();
            heatLayerRef.current = null;
        };
    }, [isLeafletLoaded, mapInstanceRef, reports, enabled]);
};
