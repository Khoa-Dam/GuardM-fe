import type { LeafletMap, LeafletLayerGroup, LeafletWindow } from '@/types/leaflet-manual';

import { useEffect, useRef } from 'react';

export const useMapInit = (isLeafletLoaded: boolean) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const markersLayerRef = useRef<LeafletLayerGroup | null>(null);
    const zonesLayerRef = useRef<LeafletLayerGroup | null>(null);

    useEffect(() => {
        if (!isLeafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

        try {
            const L = (window as unknown as LeafletWindow).L;
            if (!L || typeof L.map !== 'function') return;

            const map = L.map(mapContainerRef.current, { zoomControl: false, tap: true }).setView([10.7769, 106.7009], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Danger zone circles layer (regular layerGroup — circles can't be in cluster group)
            const zonesLayer = L.layerGroup().addTo(map);

            // Markers in cluster group with fallback
            const markersLayer = (L.markerClusterGroup
                ? L.markerClusterGroup({
                    maxClusterRadius: 60,
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: true,
                    chunkedLoading: true,
                    animate: true,
                    animateAddingMarkers: false,
                    disableClusteringAtZoom: 17,
                })
                : L.layerGroup()
            ).addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = markersLayer;
            zonesLayerRef.current = zonesLayer;
        } catch (error) {
            console.error('Map Init Error:', error);
        }
    }, [isLeafletLoaded]);

    return {
        mapContainerRef,
        mapInstanceRef,
        markersLayerRef,
        zonesLayerRef,
    };
};
