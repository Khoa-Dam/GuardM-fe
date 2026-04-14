'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label?: string;
  severity?: string;
}

interface GlobeVizProps {
  points?: GlobePoint[];
}

function GlobeComponent({ points = [] }: GlobeVizProps) {
  const globeRef = useRef<any>(null);
  const [Globe, setGlobe] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('react-globe.gl').then((mod) => {
      setGlobe(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    // Focus camera on Vietnam
    setTimeout(() => {
      globeRef.current?.pointOfView({ lat: 16.047, lng: 108.206, altitude: 1.8 }, 1500);
    }, 600);
  }, [Globe]);

  const defaultPoints: GlobePoint[] = points.length > 0 ? points : [
    { lat: 21.028, lng: 105.834, size: 0.6, color: '#ff3b3b', label: 'Hà Nội', severity: 'high' },
    { lat: 10.823, lng: 106.629, size: 0.7, color: '#ff3b3b', label: 'TP.HCM', severity: 'high' },
    { lat: 16.047, lng: 108.206, size: 0.5, color: '#ffd700', label: 'Đà Nẵng', severity: 'medium' },
    { lat: 10.045, lng: 105.747, size: 0.4, color: '#ffd700', label: 'Cần Thơ', severity: 'medium' },
    { lat: 20.844, lng: 106.688, size: 0.4, color: '#00ff88', label: 'Hải Phòng', severity: 'low' },
    { lat: 12.238, lng: 109.196, size: 0.3, color: '#00ff88', label: 'Nha Trang', severity: 'low' },
    { lat: 11.940, lng: 108.458, size: 0.3, color: '#ffd700', label: 'Đà Lạt', severity: 'medium' },
    { lat: 10.364, lng: 107.083, size: 0.35, color: '#ff3b3b', label: 'Vũng Tàu', severity: 'high' },
  ];

  if (!Globe) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin mx-auto" />
          <p className="text-[#00d4ff]/60 font-mono text-xs tracking-widest uppercase">Initializing Globe...</p>
        </div>
      </div>
    );
  }

  return (
    <Globe
      ref={globeRef}
      width={undefined}
      height={undefined}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="#00d4ff"
      atmosphereAltitude={0.12}
      pointsData={defaultPoints}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0.01}
      pointRadius="size"
      pointsMerge={false}
      pointLabel={(d: any) => `
        <div style="
          background: rgba(10,14,26,0.95);
          border: 1px solid rgba(0,212,255,0.4);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #e0e8f0;
          box-shadow: 0 0 20px rgba(0,212,255,0.3);
          backdrop-filter: blur(10px);
        ">
          <div style="color:#00d4ff;font-weight:bold;margin-bottom:4px;">${d.label || ''}</div>
          <div style="color:${d.color};font-size:10px;">● ${d.severity === 'high' ? 'HIGH RISK' : d.severity === 'medium' ? 'WARNING' : 'LOW LEVEL'}</div>
        </div>
      `}
      onGlobeReady={() => {
        const controls = globeRef.current?.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.4;
          controls.enableZoom = false;
        }
      }}
    />
  );
}

export default function GlobeViz(props: GlobeVizProps) {
  return <GlobeComponent {...props} />;
}
