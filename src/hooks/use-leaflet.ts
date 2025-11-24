'use client';

import { useEffect, useState } from 'react';

export const useLeaflet = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const checkLeafletReady = () => {
            const L = (window as any).L;
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

        const style = document.createElement('style');
        style.innerHTML = `
      .base-marker {
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid white;
        transition: transform 0.2s;
      }
      .base-marker:hover { transform: scale(1.2); }

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

      .marker-unverified { opacity: 0.6; filter: grayscale(0.5); }

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
    `;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.id = 'leaflet-script';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.crossOrigin = '';
        script.onload = checkLeafletReady;
        document.body.appendChild(script);
    }, []);

    return isLoaded;
};

