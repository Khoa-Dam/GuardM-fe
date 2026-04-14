'use client';

import { useEffect, useState } from 'react';
import { useRealtime } from '@/hooks/use-realtime';

export function LiveIndicator() {
    const [pulse, setPulse] = useState(false);
    const [recentCount, setRecentCount] = useState(0);

    useRealtime({
        onReportCreated: () => {
            setPulse(true);
            setRecentCount(c => c + 1);
            setTimeout(() => setPulse(false), 2000);
        },
    });

    // Reset count after 30s of no new reports
    useEffect(() => {
        if (recentCount === 0) return;
        const t = setTimeout(() => setRecentCount(0), 30_000);
        return () => clearTimeout(t);
    }, [recentCount]);

    return (
        <div className="absolute top-3 right-3 z-[46] flex items-center gap-1.5 rounded border border-[rgba(0,255,136,0.3)] bg-[rgba(6,10,20,0.85)] px-2.5 py-1.5 pointer-events-none"
            style={{ backdropFilter: 'blur(12px)' }}>
            <div className="relative flex items-center justify-center">
                {pulse && (
                    <div className="absolute w-3 h-3 rounded-full bg-[#00ff88]/30 animate-ping" />
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                    style={{ boxShadow: '0 0 6px #00ff88' }} />
            </div>
            <span className="font-mono text-[9px] text-[#00ff88] font-bold tracking-widest uppercase">Live</span>
            {recentCount > 0 && (
                <span className="font-mono text-[9px] text-[#00ff88]/60">+{recentCount}</span>
            )}
        </div>
    );
}
