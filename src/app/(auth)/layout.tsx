import React from "react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-[#080a0f] font-mono">

      {/* ── Left — tactical brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden border-r border-white/5">

        {/* Tactical grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '52px 52px',
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-5 left-5 w-7 h-7 border-t border-l border-[#00d4ff]/20" />
        <div className="absolute top-5 right-5 w-7 h-7 border-t border-r border-[#00d4ff]/20" />
        <div className="absolute bottom-5 left-5 w-7 h-7 border-b border-l border-[#00d4ff]/20" />
        <div className="absolute bottom-5 right-5 w-7 h-7 border-b border-r border-[#00d4ff]/20" />

        {/* Top status badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] tracking-[0.3em] text-[#00d4ff]/50 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          SYSTEM ONLINE
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* Radar rings */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#00d4ff]/6" />
            <div className="absolute inset-7 rounded-full border border-[#00d4ff]/8" />
            <div className="absolute inset-14 rounded-full border border-[#00d4ff]/10" />
            <div className="absolute inset-20 rounded-full border border-[#00d4ff]/14" />
            {/* Cross hairs */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00d4ff]/5" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00d4ff]/5" />
            {/* Blips */}
            <div className="absolute top-[29%] left-[63%] w-2 h-2 rounded-full bg-[#ff3b3b] shadow-[0_0_8px_rgba(255,59,59,0.9)]" />
            <div className="absolute top-[65%] left-[33%] w-1.5 h-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_rgba(255,215,0,0.8)]" />
            <div className="absolute top-[43%] left-[73%] w-1 h-1 rounded-full bg-[#ff3b3b] opacity-50" />
            <div className="absolute top-[72%] left-[58%] w-1 h-1 rounded-full bg-[#00d4ff] opacity-40" />
            {/* Center dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b] shadow-[0_0_16px_rgba(255,59,59,0.9)]" />
          </div>

          {/* Brand */}
          <div className="text-center space-y-3">
            <p className="text-[9px] tracking-[0.45em] text-[#00d4ff]/40 uppercase">
              OPERATIONS CENTER
            </p>
            <Link href="/" className="flex items-center justify-center gap-3 group">
              <div className="p-2 rounded bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 group-hover:bg-[#ff3b3b]/18 transition-colors">
                <Logo className="w-5 h-5 text-[#ff3b3b]" />
              </div>
              <span className="text-3xl font-black tracking-tight text-[#e8edf2]">
                GUARD<span className="text-[#ff3b3b]">[M]</span>
              </span>
            </Link>
            <p className="text-[10px] tracking-[0.28em] text-[#6b7a8d] uppercase">
              Giám sát · Xác minh · Cảnh báo
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-14">
          {[['24/7', 'ACTIVE'], ['1.2K+', 'REPORTS'], ['63', 'ZONES']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-sm font-bold text-[#e8edf2]">{val}</div>
              <div className="text-[8px] tracking-[0.22em] text-[#6b7a8d] uppercase mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — form slot ── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          {children}
        </div>
      </div>

    </div>
  );
}
