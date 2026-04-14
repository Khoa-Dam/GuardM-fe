'use client';

import React from 'react';
import { MapPin, FilePlus, BarChart3, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: MapPin, color: '#00d4ff', label: 'LIVE',
    title: 'Real-Time Incident Map',
    desc: 'Crime markers color-coded by threat level, filterable by severity, with direct focus from the report page. Dark tile layer and visual heatmap.',
  },
  {
    icon: FilePlus, color: '#ffd700', label: 'REPORT',
    title: 'Incident Reporting & Case Management',
    desc: 'Multi-step wizard to submit and edit reports, pin location on map, reverse geocoding, and detailed view in ReportCard.',
  },
  {
    icon: BarChart3, color: '#ff3b3b', label: 'STATS',
    title: 'Statistics & Analysis',
    desc: 'Analytics dashboard by crime type, district, and alert level. Real-time PieChart and BarChart visualizations.',
  },
  {
    icon: ShieldCheck, color: '#00ff88', label: 'DATA',
    title: 'Wanted Alerts & Weather Warnings',
    desc: 'Wanted persons data from the Ministry of Public Security, natural disaster and weather alerts with images, timestamps, and verified sources.',
  },
];

export const FeaturesSection: React.FC = () => (
  <section id="features" className="py-24 px-6 relative">
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.03) 0%, transparent 70%)' }} />

    <div className="max-w-6xl mx-auto relative">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded border border-[rgba(255,59,59,0.25)] bg-[rgba(255,59,59,0.06)] text-[#ff3b3b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
          Safety Ecosystem
        </div>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-white leading-tight">
          PROTECTION BUILT ON<br />
          <span style={{ color: '#00d4ff' }}>ADVANCED TECHNOLOGY</span>
        </h2>
        <p className="font-mono text-sm text-[#8899aa] max-w-xl mx-auto leading-relaxed">
          Combining community-sourced data with real-time infrastructure to deliver accurate alerts — anywhere, anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, color, label, title, desc }) => (
          <div key={title}
            className="group relative rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(12,17,32,0.7)] backdrop-blur-sm p-5 overflow-hidden hover:border-opacity-40 transition-all duration-300"
            style={{ '--hover-color': color } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}40`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at top left, ${color}06, transparent 60%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <div className="mb-4 flex items-start justify-between">
              <div className="p-2 rounded border" style={{ borderColor: `${color}30`, background: `${color}10` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="font-mono text-[8px] tracking-widest" style={{ color: `${color}80` }}>{label}</span>
            </div>

            <h3 className="font-mono text-sm font-bold text-white mb-2 leading-tight">{title}</h3>
            <p className="font-mono text-[11px] text-[#8899aa] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
