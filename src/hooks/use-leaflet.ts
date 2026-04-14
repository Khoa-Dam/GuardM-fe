'use client';

import { useEffect, useState } from 'react';

export const useLeaflet = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkLeafletReady = () => {
      const L = (window as unknown as import('@/types/leaflet-manual').LeafletWindow).L;
      if (L && typeof L.map === 'function') {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkLeafletReady()) return;

    const existingScript = document.getElementById('leaflet-script');
    if (existingScript) {
      existingScript.addEventListener('load', checkLeafletReady);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const clusterLink = document.createElement('link');
    clusterLink.rel = 'stylesheet';
    clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
    document.head.appendChild(clusterLink);

    const style = document.createElement('style');
    style.innerHTML = `
      .base-marker {
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid white;
        transition: transform 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      .base-marker:hover { 
        transform: scale(1.2); 
        box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
      }

      .pulse-ring {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 50%;
        animation: pulse 2s infinite;
        z-index: -1;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(var(--color-rgb), 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(var(--color-rgb), 0); }
        100% { box-shadow: 0 0 0 0 rgba(var(--color-rgb), 0); }
      }

      .marker-unverified { 
        opacity: 0.9; 
        filter: none;
      }

      .my-location-pulse {
        display: block;
        border-radius: 50%;
        background: #2563eb;
        border: 2px solid white;
        box-shadow: 0 0 0 rgba(37, 99, 235, 0.7);
        animation: blue-pulse 2s infinite;
      }
      @keyframes blue-pulse {
        0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
        100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
      }

      @media (max-width: 640px) { .leaflet-control-zoom { display: none; } }

      /* ── Marker Cluster dark theme ── */
      .marker-cluster-small,
      .marker-cluster-medium,
      .marker-cluster-large {
        background-color: rgba(0, 212, 255, 0.15) !important;
      }
      .marker-cluster-small div,
      .marker-cluster-medium div,
      .marker-cluster-large div {
        background-color: rgba(0, 212, 255, 0.35) !important;
        color: #fff !important;
        font-family: 'Space Mono', monospace !important;
        font-size: 11px !important;
        font-weight: bold !important;
        border: 1px solid rgba(0, 212, 255, 0.5) !important;
        box-shadow: 0 0 12px rgba(0, 212, 255, 0.4) !important;
      }
      .marker-cluster-large div {
        background-color: rgba(255, 59, 59, 0.4) !important;
        border-color: rgba(255, 59, 59, 0.6) !important;
        box-shadow: 0 0 12px rgba(255, 59, 59, 0.4) !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.id = 'leaflet-script';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.crossOrigin = '';
    script.onload = () => {
      // Load markercluster after Leaflet
      const clusterScript = document.createElement('script');
      clusterScript.id = 'leaflet-cluster-script';
      clusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
      clusterScript.async = true;
      clusterScript.onload = () => {
        // Load heat layer after markercluster
        const heatScript = document.createElement('script');
        heatScript.id = 'leaflet-heat-script';
        heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
        heatScript.async = true;
        heatScript.onload = checkLeafletReady;
        document.body.appendChild(heatScript);
      };
      document.body.appendChild(clusterScript);
    };
    document.body.appendChild(script);
  }, []);

  return isLoaded;
};

