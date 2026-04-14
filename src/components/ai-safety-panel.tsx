'use client';

import { useState, useCallback } from 'react';
import { Brain, Shield, TrendingUp, MapPin, Loader2, AlertTriangle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/utils/apiClient.util';
import { motion, AnimatePresence } from 'motion/react';

interface AreaAnalysis {
    safetyScore: number;
    level: 'safe' | 'moderate' | 'dangerous';
    summary: string;
    trends: string[];
    recommendation: string;
    reportCount: number;
}

interface AISafetyPanelProps {
    lat: number | null;
    lng: number | null;
    address?: string;
    className?: string;
}

const scoreColor = (score: number) =>
    score >= 70 ? '#00ff88' : score >= 40 ? '#ffd700' : '#ff3b3b';

const levelLabel = (level: string) =>
    level === 'safe' ? 'AN TOÀN' : level === 'moderate' ? 'CẢNH BÁO' : 'NGUY HIỂM';

// Circular score gauge
function ScoreGauge({ score, color }: { score: number; color: string }) {
    const r = 28;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                    cx="36" cy="36" r={r} fill="none"
                    stroke={color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-sm font-bold" style={{ color }}>{score}</span>
            </div>
        </div>
    );
}

export function AISafetyPanel({ lat, lng, address, className }: AISafetyPanelProps) {
    const [analysis, setAnalysis] = useState<AreaAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    const analyze = useCallback(async () => {
        if (!lat || !lng) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post<AreaAnalysis>('/ai/analyze', { lat, lng, radiusKm: 2 });
            setAnalysis(res.data);
            setExpanded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể phân tích. Thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [lat, lng]);

    const color = analysis ? scoreColor(analysis.safetyScore) : '#00d4ff';

    return (
        <div className={cn('rounded border border-[rgba(0,212,255,0.18)] overflow-hidden', className)}
            style={{ background: 'rgba(6,10,20,0.95)', backdropFilter: 'blur(16px)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,212,255,0.1)]">
                <div className="flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5 text-[#00d4ff]" />
                    <span className="font-mono text-[10px] text-[#00d4ff]/70 uppercase tracking-widest">AI Safety Analysis</span>
                </div>
                {analysis && (
                    <button onClick={() => setExpanded(v => !v)} className="text-[#8899aa] hover:text-white transition-colors">
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                )}
            </div>

            {/* Location */}
            {address && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
                    <MapPin className="h-3 w-3 text-[#00d4ff]/40 shrink-0" />
                    <span className="font-mono text-[9px] text-[#8899aa] truncate">{address}</span>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!analysis && !loading && (
                    <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-4 py-4 space-y-3">
                        <p className="font-mono text-[10px] text-[#8899aa] leading-relaxed">
                            Phân tích tình hình an ninh khu vực hiện tại dựa trên dữ liệu báo cáo thực tế + AI.
                        </p>
                        {error && (
                            <div className="flex items-center gap-2 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.08)] px-3 py-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-[#ff3b3b] shrink-0" />
                                <span className="font-mono text-[9px] text-[#ff3b3b]">{error}</span>
                            </div>
                        )}
                        <button
                            onClick={analyze}
                            disabled={!lat || !lng}
                            className="w-full flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-widest rounded border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.08)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.15)] py-2.5 transition-all disabled:opacity-30"
                            style={{ boxShadow: '0 0 12px rgba(0,212,255,0.1)' }}>
                            <Zap className="h-3.5 w-3.5" />
                            Phân tích khu vực này
                        </button>
                    </motion.div>
                )}

                {loading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-8 gap-3">
                        <div className="relative">
                            <Brain className="h-8 w-8 text-[#00d4ff]/20" />
                            <Loader2 className="h-8 w-8 text-[#00d4ff] animate-spin absolute inset-0" />
                        </div>
                        <p className="font-mono text-[9px] text-[#00d4ff]/50 tracking-widest uppercase">AI đang phân tích...</p>
                    </motion.div>
                )}

                {analysis && expanded && (
                    <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-4 space-y-4">
                        {/* Score + level */}
                        <div className="flex items-center gap-4">
                            <ScoreGauge score={analysis.safetyScore} color={color} />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold" style={{ color }}>
                                        {levelLabel(analysis.level)}
                                    </span>
                                    <span className="font-mono text-[9px] text-[#8899aa] border border-[rgba(255,255,255,0.1)] px-1.5 rounded">
                                        {analysis.reportCount} báo cáo
                                    </span>
                                </div>
                                <p className="font-mono text-[10px] text-[#8899aa] leading-relaxed">{analysis.summary}</p>
                            </div>
                        </div>

                        {/* Trends */}
                        {analysis.trends?.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3 text-[#ffd700]" />
                                    <span className="font-mono text-[9px] text-[#ffd700]/70 uppercase tracking-widest">Xu hướng</span>
                                </div>
                                {analysis.trends.map((t, i) => (
                                    <div key={i} className="flex items-start gap-2 pl-1">
                                        <div className="w-1 h-1 rounded-full bg-[#ffd700]/50 mt-1.5 shrink-0" />
                                        <p className="font-mono text-[9px] text-[#8899aa] leading-relaxed">{t}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recommendation */}
                        <div className="rounded border px-3 py-2.5 space-y-1"
                            style={{ borderColor: `${color}30`, backgroundColor: `${color}06` }}>
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3 w-3" style={{ color }} />
                                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>Khuyến nghị</span>
                            </div>
                            <p className="font-mono text-[10px] text-[#8899aa] leading-relaxed">{analysis.recommendation}</p>
                        </div>

                        {/* Re-analyze */}
                        <button onClick={analyze}
                            className="w-full font-mono text-[9px] text-[#8899aa] hover:text-[#00d4ff] uppercase tracking-widest transition-colors py-1">
                            ↻ Phân tích lại
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-20" />
        </div>
    );
}
