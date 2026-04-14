'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, MapPin, Clock, Newspaper, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GlobalAlert } from '@/hooks/use-global-alerts';

interface NewsPanelProps {
    alerts: GlobalAlert[];
    open: boolean;
    onClose: () => void;
    onSelectAlert: (alert: GlobalAlert) => void;
}

const SEVERITY_CONFIG = {
    high:   { label: 'Nguy hiểm', color: '#ff3b3b', bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30', dot: 'bg-[#ff3b3b]' },
    medium: { label: 'Cảnh báo',  color: '#ffd700', bg: 'bg-[#ffd700]/10', border: 'border-[#ffd700]/30', dot: 'bg-[#ffd700]' },
    low:    { label: 'Thấp',      color: '#00ff88', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/20', dot: 'bg-[#00ff88]' },
} as const;

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return `${Math.floor(diff / 60_000)}p trước`;
    if (h < 24) return `${h}h trước`;
    return `${Math.floor(h / 24)}d trước`;
}

function AlertItem({ alert, onClick }: { alert: GlobalAlert; onClick: () => void }) {
    const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/4 transition-colors group flex gap-3',
            )}
        >
            {/* Severity bar */}
            <div className="flex-shrink-0 flex flex-col items-center pt-1 gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', sev.dot)} />
                <div className="w-px flex-1 bg-white/5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-[13px] font-medium text-[#e8edf2] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {alert.title}
                </p>
                {alert.summary && (
                    <p className="text-[11px] text-[#6b7a8d] line-clamp-2 leading-relaxed">
                        {alert.summary}
                    </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                    {alert.locationName && (
                        <span className="flex items-center gap-1 text-[10px] text-[#8899aa]">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate max-w-[120px]">{alert.locationName}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-[#8899aa]">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        {timeAgo(alert.publishedAt)}
                    </span>
                    <span className="text-[10px] text-[#6b7a8d] truncate max-w-[80px]">
                        {alert.source}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className={cn('text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded border', sev.bg, sev.border)} style={{ color: sev.color }}>
                        {sev.label}
                    </span>
                    {alert.url && (
                        <a
                            href={alert.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[10px] text-[#6b7a8d] hover:text-[#00d4ff] transition-colors"
                        >
                            <ExternalLink className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">Nguồn</span>
                        </a>
                    )}
                </div>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-[#6b7a8d] group-hover:text-[#00d4ff] self-center flex-shrink-0 transition-colors" />
        </button>
    );
}

export function NewsPanel({ alerts, open, onClose, onSelectAlert }: NewsPanelProps) {
    const [search, setSearch] = useState('');
    const [sevFilter, setSevFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const filtered = alerts.filter(a => {
        if (sevFilter !== 'all' && a.severity !== sevFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return a.title.toLowerCase().includes(q) || a.locationName?.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q);
        }
        return true;
    });

    const counts = {
        high:   alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low:    alerts.filter(a => a.severity === 'low').length,
    };

    const panelContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 flex-shrink-0">
                <Newspaper className="h-4 w-4 text-[#ff9a3c]" />
                <span className="font-mono text-xs font-bold tracking-[0.15em] text-[#e8edf2] uppercase flex-1">
                    Tin tức
                </span>
                <span className="font-mono text-[10px] text-[#8899aa] bg-white/6 px-1.5 py-0.5 rounded">
                    {alerts.length}
                </span>
                <button onClick={onClose}
                    className="ml-1 p-1 rounded hover:bg-white/8 text-[#6b7a8d] hover:text-[#e8edf2] transition-colors">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Severity filter tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-white/5 flex-shrink-0">
                {([
                    { v: 'all',    label: 'Tất cả', count: alerts.length, color: '#8899aa' },
                    { v: 'high',   label: 'Nguy hiểm', count: counts.high,   color: '#ff3b3b' },
                    { v: 'medium', label: 'Cảnh báo',  count: counts.medium, color: '#ffd700' },
                    { v: 'low',    label: 'Thấp',       count: counts.low,    color: '#00ff88' },
                ] as const).map(tab => (
                    <button key={tab.v}
                        onClick={() => setSevFilter(tab.v)}
                        className={cn(
                            'flex-1 font-mono text-[9px] py-1 rounded border transition-all',
                            sevFilter === tab.v
                                ? 'border-transparent text-[#080a0f] font-bold'
                                : 'border-transparent text-[#6b7a8d] hover:text-[#8899aa] bg-transparent',
                        )}
                        style={sevFilter === tab.v ? { backgroundColor: tab.color, color: '#080a0f' } : {}}
                    >
                        {tab.label}
                        {tab.count > 0 && <span className="ml-0.5 opacity-70">({tab.count})</span>}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-white/5 flex-shrink-0">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm tin tức..."
                    className="w-full bg-white/5 border border-white/8 rounded px-3 py-1.5 font-mono text-[11px] text-[#e8edf2] placeholder:text-[#6b7a8d] outline-none focus:border-[#00d4ff]/40 transition-colors"
                />
            </div>

            {/* Alert count */}
            {filtered.length > 0 && (
                <div className="px-4 py-1.5 flex-shrink-0">
                    <span className="font-mono text-[9px] tracking-widest text-[#6b7a8d] uppercase">
                        {filtered.length} kết quả
                    </span>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <AlertTriangle className="h-6 w-6 text-[#6b7a8d]" />
                        <p className="font-mono text-[11px] text-[#6b7a8d]">Không có kết quả</p>
                    </div>
                ) : (
                    filtered.map(alert => (
                        <AlertItem
                            key={alert.id}
                            alert={alert}
                            onClick={() => onSelectAlert(alert)}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* ── Desktop: left sidebar ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="news-desktop"
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute top-0 left-0 bottom-0 z-[46] hidden md:flex flex-col w-72 border-r border-white/8 overflow-hidden"
                        style={{ background: 'rgba(6,10,20,0.95)', backdropFilter: 'blur(20px)' }}
                    >
                        {panelContent}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mobile: bottom sheet ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="news-mobile"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                        className="absolute bottom-0 left-0 right-0 z-[46] flex md:hidden flex-col rounded-t-xl border-t border-white/10 overflow-hidden"
                        style={{ maxHeight: '60%', background: 'rgba(6,10,20,0.97)', backdropFilter: 'blur(20px)' }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
                            <div className="w-8 h-1 rounded-full bg-white/20" />
                        </div>
                        {panelContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
