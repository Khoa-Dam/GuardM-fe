'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Shield, Activity, MapPin } from 'lucide-react';

const GLOBE_SIZE = 450;
const GLOBE_RADIUS = GLOBE_SIZE / 2;
const MAP_CIRCUMFERENCE = 2 * Math.PI * GLOBE_RADIUS;

interface HeroProps { appUrl: string; }

const TechGlobe = () => {
  const [rotation, setRotation] = useState(0);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setRotation(prev => prev + 0.0015);
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, []);

  const bgPos = ((rotation % (2 * Math.PI)) / (2 * Math.PI)) * MAP_CIRCUMFERENCE;

  // Crime hotspot dots on Vietnam
  const dots = [
    { cx: '52%', cy: '41%', r: 4, color: '#ff3b3b', delay: '0s' },
    { cx: '50%', cy: '55%', r: 5, color: '#ff3b3b', delay: '0.4s' },
    { cx: '54%', cy: '48%', r: 3, color: '#ffd700', delay: '0.8s' },
    { cx: '48%', cy: '35%', r: 3, color: '#ffd700', delay: '1.2s' },
    { cx: '53%', cy: '62%', r: 4, color: '#00ff88', delay: '0.6s' },
    { cx: '46%', cy: '50%', r: 3, color: '#00d4ff', delay: '1s' },
  ];

  return (
    <div className="relative flex items-center justify-center w-full max-w-[480px] mx-auto aspect-square">
      {/* Outer glow rings */}
      <div className="absolute inset-[-40px] rounded-full opacity-20 animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }} />
      <div className="absolute inset-[-20px] rounded-full border border-[rgba(0,212,255,0.1)]" />
      <div className="absolute inset-[-8px] rounded-full border border-[rgba(0,212,255,0.15)]" />

      {/* Globe */}
      <div className="relative w-full aspect-square rounded-full overflow-hidden border border-[rgba(0,212,255,0.25)]">
        {/* Dark ocean bg */}
        <div className="absolute inset-0 bg-[#0a1628]" />

        {/* World map */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/world-map.png')",
            backgroundSize: `${MAP_CIRCUMFERENCE}px 100%`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: `${-bgPos}px center`,
            filter: 'hue-rotate(180deg) brightness(1.5) saturate(0.6)',
          }} />

        {/* Grid overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }} />

        {/* Crime dots */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {dots.map((d, i) => (
            <g key={i}>
              <circle cx={d.cx} cy={d.cy} r={d.r * 0.4} fill={d.color} opacity="0.9" />
              <circle cx={d.cx} cy={d.cy} r={d.r * 0.4} fill={d.color} opacity="0.5">
                <animate attributeName="r" values={`${d.r * 0.4};${d.r * 1.2};${d.r * 0.4}`}
                  dur="2s" repeatCount="indefinite" begin={d.delay} />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" begin={d.delay} />
              </circle>
            </g>
          ))}
        </svg>

        {/* Sphere lighting */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(0,212,255,0.08), transparent 60%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      {/* HUD corner brackets */}
      {[['top-2 left-2', 'border-t border-l'], ['top-2 right-2', 'border-t border-r'],
        ['bottom-2 left-2', 'border-b border-l'], ['bottom-2 right-2', 'border-b border-r']].map(([pos, border], i) => (
        <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-[#00d4ff] opacity-60`} />
      ))}

      {/* Floating stat badges */}
      <div className="absolute -left-4 top-1/3 font-mono text-[9px] bg-[rgba(8,12,24,0.9)] border border-[rgba(0,212,255,0.2)] px-2 py-1 rounded text-[#00d4ff]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          LIVE
        </div>
      </div>
      <div className="absolute -right-6 bottom-1/3 font-mono text-[9px] bg-[rgba(8,12,24,0.9)] border border-[rgba(255,59,59,0.2)] px-2 py-1 rounded text-[#ff3b3b]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
          ALERT
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<HeroProps> = ({ appUrl }) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] -translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,59,59,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)] text-[#00d4ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
            Global Crime Monitoring System
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-wide">
              <span className="text-white">CRIME</span><br />
              <span className="text-white">ALERT</span><br />
              <span style={{
                background: 'linear-gradient(90deg, #ff3b3b, #ff6b35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>MAP</span>
            </h1>
          </div>

          <p className="font-mono text-sm text-[#8899aa] leading-relaxed max-w-lg">
            GuardM — a real-time security surveillance system. Statistics dashboard,
            crime map, community reports, wanted criminals list, and weather alerts
            connected to live data.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Activity, label: 'Real-time data', color: '#00d4ff' },
              { icon: MapPin, label: 'Heatmap & markers', color: '#ffd700' },
              { icon: Shield, label: 'Role-based security', color: '#00ff88' },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8899aa]">
                <Icon className="w-3 h-3" style={{ color }} />
                {label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 pt-2">
            <a href={appUrl}
              className="group relative flex items-center gap-2.5 font-mono text-sm font-bold tracking-widest uppercase px-6 py-3 rounded border border-[rgba(255,59,59,0.5)] bg-[rgba(255,59,59,0.12)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.2)] hover:text-white transition-all duration-200 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-[rgba(255,59,59,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Access the app</span>
              <ChevronRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-mono text-[10px] text-[#00ff88]">SYSTEM ONLINE</span>
            </div>
            <span className="font-mono text-[10px] text-[#8899aa]/40">|</span>
            <span className="font-mono text-[10px] text-[#8899aa]">Vietnam Coverage Active</span>
          </div>
        </div>

        {/* Right: Globe */}
        <div className="hidden sm:flex justify-center">
          <TechGlobe />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #060a14)' }} />
    </section>
  );
};
