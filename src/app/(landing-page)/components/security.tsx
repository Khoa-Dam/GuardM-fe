'use client';

import React from 'react';
import { Lock, Users, Server } from 'lucide-react';

const securityItems = [
  'Session-based authentication via NextAuth — dashboard access requires verified login',
  'Role-based access control with distinct permissions for user and admin roles',
  'Server-side API enforcement for protected reporting and wanted-persons features',
];

const securityBadges = [
  { label: 'Auth Session', value: 'NextAuth session', color: '#00ff88' },
  { label: 'Protected Zones', value: 'Dashboard & Map', color: '#00d4ff' },
  { label: 'Sensitive APIs', value: 'Reports & Wanted', color: '#ffd700' },
];

export const SecuritySection: React.FC = () => (
  <section id="security" className="py-24 px-6 relative">
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(0,255,136,0.03) 0%, transparent 60%)' }} />

    <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
      {/* Left */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)] text-[#00d4ff]">
          <Lock className="w-3 h-3" />
          Multi-Layer Security
        </div>

        <h3 className="font-mono text-3xl font-bold text-white leading-tight">
          HARDENED INFRASTRUCTURE<br />
          <span style={{ color: '#00ff88' }}>ENTERPRISE-GRADE STANDARDS</span>
        </h3>

        <p className="font-mono text-sm text-[#8899aa] leading-relaxed">
          GuardM applies end-to-end encryption for all location data, enforces strict
          role-based access control, and stores data on infrastructure certified to ISO/IEC 27001.
        </p>

        <div className="space-y-3">
          {securityItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5 shrink-0" />
              <span className="font-mono text-xs text-[#8899aa] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Security info panel */}
      <div className="rounded border border-[rgba(0,255,136,0.15)] bg-[rgba(12,17,32,0.8)] backdrop-blur-sm overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,255,136,0.1)]">
          <Server className="w-4 h-4 text-[#00ff88]" />
          <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-widest">SECURITY STATUS</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="font-mono text-[9px] text-[#00ff88]">ACTIVE</span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {securityBadges.map(({ label, value, color }, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-[#8899aa]">{label}</span>
                <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded border"
                  style={{ color, borderColor: `${color}30`, background: `${color}10` }}>
                  {value}
                </span>
              </div>
              {i < securityBadges.length - 1 && (
                <div className="h-px bg-[rgba(255,255,255,0.04)]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom status */}
        <div className="px-5 py-4 border-t border-[rgba(0,255,136,0.1)] flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span className="font-mono text-[10px] text-[#8899aa]">Google OAuth + Credentials login supported</span>
        </div>
      </div>
    </div>
  </section>
);
