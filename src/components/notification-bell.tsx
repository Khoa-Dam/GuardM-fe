'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Shield, Info, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import { useRealtime } from '@/hooks/use-realtime';
import { useReportsQuery } from '@/hooks/use-crime-reports';
import { AnimatePresence, motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

const severityIcon = (s: string) => {
    if (s === 'high')   return <AlertTriangle className="h-3.5 w-3.5 text-[#ff3b3b]" />;
    if (s === 'medium') return <Shield className="h-3.5 w-3.5 text-[#ffd700]" />;
    return <Info className="h-3.5 w-3.5 text-[#00d4ff]" />;
};

const severityBg = (s: string) =>
    s === 'high' ? 'border-[rgba(255,59,59,0.2)] bg-[rgba(255,59,59,0.05)]' :
    s === 'medium' ? 'border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.05)]' :
    'border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]';

export function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, addFromReport, seedFromReports, markRead, markAllRead, clearAll } = useNotifications();
    const { data: reports } = useReportsQuery();
    const seededRef = useRef(false);

    // Seed bell with recent medium/high reports on first load (read = true → no badge spike)
    useEffect(() => {
        if (seededRef.current || !reports?.length) return;
        seededRef.current = true;
        const recent = reports
            .filter(r => r.severityLevel !== 'low')
            .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
            .slice(0, 10);
        seedFromReports(recent);
    }, [reports, seedFromReports]);

    // Connect realtime — add notifications on new reports
    useRealtime({
        onReportCreated: addFromReport,
        onNearbyAlert: addFromReport,
    });

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = (reportId: string, notifId: string) => {
        markRead(notifId);
        setOpen(false);
        router.push(`/map?focus=${reportId}`);
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded border transition-all duration-200',
                    open
                        ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                        : 'border-[rgba(255,255,255,0.1)] bg-transparent text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
                )}
                aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#ff3b3b] font-mono text-[9px] font-bold text-white flex items-center justify-center px-0.5"
                        style={{ boxShadow: '0 0 8px rgba(255,59,59,0.6)' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-[56px] sm:top-full sm:mt-2 sm:w-80 rounded border border-[rgba(0,212,255,0.2)] overflow-hidden z-[9999]"
                        style={{ background: 'rgba(6,10,20,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,212,255,0.1)]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                                <span className="font-mono text-[10px] text-[#00d4ff]/60 uppercase tracking-widest">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="font-mono text-[9px] text-[#ff3b3b] border border-[rgba(255,59,59,0.3)] px-1.5 rounded">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="p-1 rounded text-[#8899aa] hover:text-[#00d4ff] transition-colors" title="Mark all as read">
                                        <CheckCheck className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="p-1 rounded text-[#8899aa] hover:text-[#ff3b3b] transition-colors" title="Clear all">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 rounded text-[#8899aa] hover:text-white transition-colors">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto" style={{ maxHeight: 'min(360px, 60vh)' }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <Bell className="h-8 w-8 text-[#8899aa]/20" />
                                    <p className="font-mono text-[10px] text-[#8899aa]/50 tracking-widest uppercase">No notifications</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {notifications.map((n, i) => (
                                        <motion.button
                                            key={n.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => handleClick(n.reportId, n.id)}
                                            className={cn(
                                                'w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 transition-colors hover:bg-[rgba(0,212,255,0.04)]',
                                                !n.read && 'bg-[rgba(0,212,255,0.02)]'
                                            )}>
                                            {/* Icon */}
                                            <div className={cn('mt-0.5 w-7 h-7 rounded shrink-0 flex items-center justify-center border', severityBg(n.severity))}>
                                                {severityIcon(n.severity)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn('font-mono text-xs truncate', n.read ? 'text-[#8899aa]' : 'text-white font-bold')}>
                                                        {n.title}
                                                    </p>
                                                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shrink-0" />}
                                                </div>
                                                <p className="font-mono text-[9px] text-[#8899aa] truncate">{n.address}</p>
                                                <p className="font-mono text-[9px] text-[#8899aa]/40">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {n.read && <Check className="h-3 w-3 text-[#8899aa]/30 shrink-0 mt-1" />}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-20" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
