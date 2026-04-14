'use client';

import React from 'react';

const stats = [
  { value: 'Real-time', label: 'Analytics Dashboard', color: '#00d4ff' },
  { value: 'Map', label: 'Crime Heatmap & Markers', color: '#ffd700' },
  { value: 'Wanted', label: 'Live Data Sync', color: '#ff3b3b' },
  { value: 'Weather', label: 'Disaster Alerts', color: '#00ff88' },
];

export const StatsSection: React.FC = () => (
  <section className="py-16 relative">
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.02) 50%, transparent)' }} />
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => (
        <div key={stat.label}
          className="group relative rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(12,17,32,0.6)] backdrop-blur-sm p-5 text-center overflow-hidden hover:border-[rgba(0,212,255,0.2)] transition-all duration-300">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${stat.color}08, transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />

          <p className="font-mono text-xl sm:text-2xl md:text-3xl font-bold mb-2 relative"
            style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}50` }}>
            {stat.value}
          </p>
          <p className="font-mono text-[9px] text-[#8899aa] uppercase tracking-widest leading-tight relative">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </section>
);
