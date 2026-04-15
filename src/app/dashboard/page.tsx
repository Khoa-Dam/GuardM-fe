'use client';

import { useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileWarning, AlertTriangle, ShieldCheck, Users, Shield,
  Eye, MapPin, Activity, Zap, Globe, ChevronRight,
} from 'lucide-react';
import { useHomeData } from '@/hooks/use-home-data';
import { useStatistics, useHeatmap } from '@/hooks/use-statistics';
import { Spinner } from '@/components/ui/spinner';

// Lazy-load heavy components
const GlobeViz = dynamic(() => import('./components/GlobeViz'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
    </div>
  ),
});

const CrimeTypePieChart = dynamic(() => import('./components/CrimeTypePieChart'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center"><Spinner className="h-6 w-6 text-muted-foreground" /></div>,
});

const DistrictBarChart = dynamic(() => import('./components/DistrictBarChart'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center"><Spinner className="h-6 w-6 text-muted-foreground" /></div>,
});

gsap.registerPlugin(ScrollTrigger);

const crimeTypeLabels: Record<string, string> = {
  truy_na: 'Wanted', nghi_pham: 'Suspect', dang_ngo: 'Suspicious',
  de_doa: 'Threat', giet_nguoi: 'Homicide', bat_coc: 'Kidnapping',
  cuop_giat: 'Robbery', trom_cap: 'Theft',
};
const typeColors = ['#ff3b3b', '#ff6b35', '#ffd700', '#00ff88', '#00d4ff', '#a855f7', '#ec4899', '#14b8a6'];

const severityColor = (s: string) =>
  s === 'high' ? 'text-[#ff3b3b] border-[#ff3b3b]/30 bg-[#ff3b3b]/10' :
    s === 'medium' ? 'text-[#ffd700] border-[#ffd700]/30 bg-[#ffd700]/10' :
      'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10';

const severityLabel = (s: string) => s === 'high' ? 'DANGEROUS' : s === 'medium' ? 'WARNING' : 'SAFE';

export default function DashboardPage() {
  const { data: homeData, isLoading: homeLoading } = useHomeData();
  const { data: statistics, isLoading: statsLoading } = useStatistics();
  const { data: heatmapData = [], isLoading: heatmapLoading } = useHeatmap();

  const loading = homeLoading || statsLoading || heatmapLoading;
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll('.stat-card');
    gsap.fromTo(cards,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', once: true },
      }
    );
  }, []);

  useEffect(() => {
    sectionRefs.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );
    });
    headingRefs.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    });
  }, []);

  const summaryCards = useMemo(() => [
    { title: 'TOTAL REPORTS', value: statistics?.total, icon: FileWarning, color: '#00d4ff' },
    { title: 'ACTIVE ALERTS', value: statistics?.activeAlerts, icon: Activity, color: '#ffd700' },
    { title: 'HIGH SEVERITY', value: statistics?.highSeverity, icon: AlertTriangle, color: '#ff3b3b' },
    { title: 'WANTED CRIMINALS', value: homeData?.statistics.totalWanted, icon: Users, color: '#00ff88' },
  ], [statistics, homeData]);

  const crimeTypeData = useMemo(() =>
    (statistics?.byType ?? []).map((item) => ({ label: crimeTypeLabels[item.type] ?? item.type, count: item.count })),
    [statistics]
  );
  const topDistricts = useMemo(() => (statistics?.byDistrict ?? []).slice(0, 6), [statistics]);
  const heatmapHighlights = useMemo(() => heatmapData.slice(0, 6), [heatmapData]);
  const displayedWanted = (homeData?.recentWantedCriminals ?? []).slice(0, 6);

  return (
    <div>
      {/* ── HERO: 3D Globe + HUD ─────────────────────────────────────────── */}
      <section className="relative h-[520px] md:h-[600px] overflow-hidden">
        {/* Scan-line overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none z-10" />
        {/* Grid background */}
        <div className="grid-bg absolute inset-0 pointer-events-none z-0" />

        {/* Globe */}
        <div className="absolute inset-0 z-0">
          <GlobeViz />
        </div>

        {/* Gradient vignette bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

        {/* HUD – top-left title */}
        <div className="absolute top-6 left-6 z-20 hud-border pl-4 py-2 pr-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-pulse" />
            <span className="font-mono text-[10px] text-[#00d4ff]/60 tracking-[0.3em] uppercase">GuardM System v2.0</span>
          </div>
          <h1 className="font-mono text-xl md:text-2xl font-bold text-white mt-1">
            CRIME SURVEILLANCE
          </h1>
          <p className="font-mono text-[10px] text-[#00d4ff]/50 tracking-widest">REAL-TIME MONITORING — VIETNAM</p>
        </div>

        {/* HUD – top-right quick stats */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 items-end">
          {[
            { label: 'TOTAL REPORTS', val: statistics?.total, color: '#00d4ff' },
            { label: 'HIGH SEVERITY', val: statistics?.highSeverity, color: '#ff3b3b' },
            { label: 'WANTED', val: homeData?.statistics?.totalWanted, color: '#00ff88' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 hud-border px-3 py-1.5 text-right">
              <span className="font-mono text-[9px] text-[#00d4ff]/50 tracking-widest">{item.label}</span>
              <span className="font-mono text-sm font-bold" style={{ color: item.color, textShadow: `0 0 10px ${item.color}80` }}>
                {loading ? '—' : (item.val ?? 0).toLocaleString('en-US')}
              </span>
            </div>
          ))}
        </div>

        {/* HUD – bottom status bar */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
          <div className="flex items-center gap-6 hud-border px-6 py-2">
            <span className="flex items-center gap-2 font-mono text-[10px] text-[#00ff88]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="font-mono text-[10px] text-[#00d4ff]/40">|</span>
            <span className="font-mono text-[10px] text-[#00d4ff]/60">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-[#00d4ff]/40">|</span>
            <Link href="/map" className="flex items-center gap-1 font-mono text-[10px] text-[#00d4ff] hover:text-white transition-colors">
              <MapPin className="w-3 h-3" /> VIEW MAP <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-6 py-8">
        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {summaryCards.map((stat) => (
            <div
              key={stat.title}
              className="stat-card glass-card group relative overflow-hidden cursor-default"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-5"
                style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent)` }} />

              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">{stat.title}</span>
                <stat.icon className="h-3.5 w-3.5 shrink-0" style={{ color: stat.color }} />
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}>
                {loading ? <Spinner className="h-6 w-6" /> : (stat.value ?? 0).toLocaleString('en-US')}
              </div>
              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-px opacity-40 group-hover:opacity-80 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
            </div>
          ))}
        </div>

        {/* ── WANTED CRIMINALS ─────────────────────────────────────────────── */}
        <div ref={(el) => { sectionRefs.current[0] = el; }}>
          <div className="flex items-center justify-between mb-4">
            <h2 ref={(el) => { headingRefs.current[0] = el; }} className="flex items-center gap-2 font-mono text-sm font-bold text-[#ff3b3b] uppercase tracking-widest">
              <Eye className="h-4 w-4" />
              <span className="border-l-2 border-[#ff3b3b] pl-3">LATEST WANTED CRIMINALS</span>
            </h2>
            <Link href="/wanted" className="flex items-center gap-1 font-mono text-[10px] text-[#00d4ff] hover:text-white transition-colors">
              VIEW ALL <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : displayedWanted.map((person) => (
              <div key={person.id} className="glass-card group flex gap-3 hover:border-[#ff3b3b]/40 transition-all duration-300">
                <div className="h-12 w-12 shrink-0 rounded bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#ff3b3b]/60" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-white truncate">{person.name}</p>
                    <span className="font-mono text-[9px] text-[#ff3b3b]/60 shrink-0">{person.birthYear}</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#ffd700]/70 truncate">{person.crime}</p>
                  <p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {person.address ?? 'Unknown'}
                  </p>
                </div>
                {/* Right accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[#ff3b3b]/0 group-hover:bg-[#ff3b3b]/60 transition-all duration-300 rounded-l" />
              </div>
            ))}
          </div>
        </div>

        {/* ── CHARTS ───────────────────────────────────────────────────────── */}
        <div ref={(el) => { sectionRefs.current[1] = el; }} className="glass-card p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
            <Shield className="h-4 w-4 text-[#00d4ff]" />
            <h2 ref={(el) => { headingRefs.current[1] = el; }} className="font-mono text-sm font-bold text-[#00d4ff] uppercase tracking-widest">
              REPORT STATISTICS
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 p-5">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">BY CRIME TYPE</p>
              <div className="h-64">
                <CrimeTypePieChart data={crimeTypeData} colors={typeColors} />
              </div>
              {crimeTypeData.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {crimeTypeData.map((item, i) => (
                    <span key={item.label} className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColors[i % typeColors.length] }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">TOP DISTRICTS</p>
              <div className="h-64">
                <DistrictBarChart data={topDistricts} />
              </div>
            </div>
          </div>
        </div>

        {/* ── HEATMAP + ALERTS ─────────────────────────────────────────────── */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          <div ref={(el) => { sectionRefs.current[2] = el; }} className="glass-card p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
              <Globe className="h-4 w-4 text-[#ffd700]" />
              <h2 className="font-mono text-sm font-bold text-[#ffd700] uppercase tracking-widest">HOTSPOTS</h2>
            </div>
            <div className="p-4 space-y-2">
              {heatmapLoading ? (
                <div className="flex justify-center py-6"><Spinner className="h-6 w-6" /></div>
              ) : heatmapHighlights.length ? heatmapHighlights.map((point, i) => (
                <div key={`${point.district}-${i}`} className="flex items-center justify-between gap-3 rounded px-3 py-2.5 border border-border/40 hover:border-[#00d4ff]/30 transition-colors group">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-mono text-xs font-semibold text-white truncate">{point.district || point.province || 'N/A'}</p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      {crimeTypeLabels[point.crimeType] ?? point.crimeType} · {point.count.toLocaleString('en-US')} reports
                    </p>
                  </div>
                  <span className={`font-mono text-[9px] font-bold px-2 py-1 rounded border shrink-0 ${severityColor(point.severity)}`}>
                    {severityLabel(point.severity)}
                  </span>
                </div>
              )) : (
                <p className="font-mono text-[10px] text-muted-foreground py-4 text-center">NO DATA AVAILABLE</p>
              )}
            </div>
          </div>

          <div ref={(el) => { sectionRefs.current[3] = el; }} className="glass-card p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
              <Zap className="h-4 w-4 text-[#00ff88]" />
              <h2 className="font-mono text-sm font-bold text-[#00ff88] uppercase tracking-widest">SYSTEM NOTIFICATIONS</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded border border-[#00ff88]/20 bg-[#00ff88]/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="font-mono text-[10px] text-[#00ff88] font-bold uppercase">ALL SYSTEMS NOMINAL</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">No critical alerts. System operating normally.</p>
              </div>
              <div className="rounded border border-[#00d4ff]/20 bg-[#00d4ff]/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-3 w-3 text-[#00d4ff]" />
                  <span className="font-mono text-[10px] text-[#00d4ff] font-bold uppercase">DATA SYNC ACTIVE</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">Data is being continuously synced from all report sources.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <Link href="/map" className="flex items-center justify-between group rounded border border-[#ff3b3b]/30 bg-[#ff3b3b]/5 hover:bg-[#ff3b3b]/10 px-4 py-3 transition-colors">
                  <span className="font-mono text-xs font-bold text-[#ff3b3b] uppercase">SUBMIT INCIDENT REPORT</span>
                  <ChevronRight className="h-4 w-4 text-[#ff3b3b] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
