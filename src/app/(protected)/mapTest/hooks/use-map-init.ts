'use client';

import { useEffect, useRef } from 'react';

export const useMapInit = (isLeafletLoaded: boolean) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);

    useEffect(() => {
        if (!isLeafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

        try {
            const L = (window as any).L;
            if (!L || typeof L.map !== 'function') return;

            const map = L.map(mapContainerRef.current, { zoomControl: false, tap: true }).setView([10.7769, 106.7009], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = markersLayer;
        } catch (error) {
            console.error('Map Init Error:', error);
        }
    }, [isLeafletLoaded]);

    return {
        mapContainerRef,
        mapInstanceRef,
        markersLayerRef,
    };
};

