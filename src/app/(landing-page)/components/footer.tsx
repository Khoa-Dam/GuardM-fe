'use client';

import React from 'react';
import { Logo } from '@/components/icons';
import { siteConfig } from '@/config/site.config';

export const LandingFooter: React.FC = () => (
  <footer className="relative px-6 py-10 border-t border-[rgba(0,212,255,0.1)]">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-30" />

    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded bg-[rgba(255,59,59,0.12)] border border-[rgba(255,59,59,0.25)]">
          <Logo className="w-4 h-4 text-[#ff3b3b]" />
        </div>
        <span className="font-mono font-bold text-sm tracking-widest text-white">
          GUARD<span className="text-[#ff3b3b]">M</span>
        </span>
      </div>

      {/* Links */}
      <div className="flex gap-8">
        {[
          { label: 'GitHub', href: siteConfig.links.github },
          { label: 'Contact', href: `mailto:${siteConfig.author.email}` },
        ].map(item => (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-widest uppercase text-[#8899aa] hover:text-[#00d4ff] transition-colors duration-200 relative group">
            {item.label}
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00d4ff] group-hover:w-full transition-all duration-300" />
          </a>
        ))}
      </div>

      {/* Copyright */}
      <span className="font-mono text-[10px] text-[#8899aa]/50">© 2025 GuardM Project.</span>
    </div>
  </footer>
);
