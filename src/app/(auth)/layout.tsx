import React from "react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-[#060a14] font-mono">

      {/* ── Left — tactical brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col items-center justify-center relative overflow-hidden border-r border-white/[0.04]">

        {/* Deep background atmosphere */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(255,59,59,0.03) 0%, transparent 60%)' }} />

        {/* Tactical grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#00d4ff]/25" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#00d4ff]/25" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#00d4ff]/25" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#00d4ff]/25" />

        {/* Top status bar */}
        <div className="absolute top-7 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] tracking-[0.35em] text-[#00d4ff]/60 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          SYSTEM ONLINE
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-12">

          {/* Animated radar */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-[#00d4ff]/8" />
            <div className="absolute inset-6 rounded-full border border-[#00d4ff]/10" />
            <div className="absolute inset-12 rounded-full border border-[#00d4ff]/14" />
            <div className="absolute inset-20 rounded-full border border-[#00d4ff]/18" />

            {/* Radar sweep */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,212,255,0.18) 30deg, transparent 60deg)',
                  animation: 'radar-sweep 3s linear infinite',
                }} />
            </div>

            {/* Cross hairs */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-[#00d4ff]/8" />
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-[#00d4ff]/8" />

            {/* Threat blips */}
            <div className="absolute top-[28%] left-[62%] w-2 h-2 rounded-full bg-[#ff3b3b]"
              style={{ boxShadow: '0 0 10px 3px rgba(255,59,59,0.6)', animation: 'blip-pulse 2.2s ease-in-out infinite' }} />
            <div className="absolute top-[65%] left-[32%] w-1.5 h-1.5 rounded-full bg-[#ffd700]"
              style={{ boxShadow: '0 0 8px 2px rgba(255,215,0,0.5)', animation: 'blip-pulse 2.8s ease-in-out infinite 0.5s' }} />
            <div className="absolute top-[42%] left-[74%] w-1 h-1 rounded-full bg-[#ff3b3b] opacity-60"
              style={{ animation: 'blip-pulse 3.5s ease-in-out infinite 1s' }} />
            <div className="absolute top-[73%] left-[57%] w-1 h-1 rounded-full bg-[#00d4ff] opacity-50"
              style={{ animation: 'blip-pulse 4s ease-in-out infinite 1.5s' }} />

            {/* Center cross */}
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-[#ff3b3b]"
                style={{ boxShadow: '0 0 20px 6px rgba(255,59,59,0.7)' }} />
            </div>
          </div>

          {/* Brand */}
          <div className="text-center space-y-4">
            <p className="text-[9px] tracking-[0.5em] text-[#00d4ff]/40 uppercase">
              OPERATIONS CENTER
            </p>
            <Link href="/" className="flex items-center justify-center gap-3 group">
              <div className="p-2 rounded bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 group-hover:bg-[#ff3b3b]/20 transition-colors">
                <Logo className="w-5 h-5 text-[#ff3b3b]" />
              </div>
              <span className="text-3xl font-black tracking-tight text-[#e8edf2] font-heading">
                GUARD<span className="text-[#ff3b3b]">[M]</span>
              </span>
            </Link>
            <p className="text-[10px] tracking-[0.3em] text-[#6b7a8d] uppercase">
              Monitor · Verify · Alert
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-2 w-52">
            {[
              { color: '#00d4ff', text: 'Real-time crime heatmap' },
              { color: '#ffd700', text: 'Community incident reports' },
              { color: '#ff3b3b', text: 'Wanted persons database' },
              { color: '#00ff88', text: 'Weather & disaster alerts' },
            ].map(({ color, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-[10px] text-[#6b7a8d] tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-7 left-0 right-0 text-center">
          <p className="text-[8px] tracking-[0.3em] text-[#6b7a8d]/40 uppercase">Vietnam Surveillance Network · 24/7</p>
        </div>
      </div>

      {/* ── Right — form slot ── */}
      <div className="flex w-full lg:w-[48%] items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>

      {/* Radar sweep keyframes */}
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blip-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>

    </div>
  );
}
