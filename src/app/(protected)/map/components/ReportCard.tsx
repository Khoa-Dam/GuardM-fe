'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import { X, MapPin, Check, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Pencil, Trash2, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import reportService, { VoteStatus } from '@/service/report.service';
import { useUser } from '@/hooks/use-user';

// ── Helpers ──────────────────────────────────────────────────────────────────
const isVideoUrl = (url: string) => {
    if (url.startsWith('data:video/')) return true;
    const exts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const hosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    const l = url.toLowerCase();
    return exts.some(e => l.includes(e)) || hosts.some(h => l.includes(h));
};
const isEmbeddable = (url: string) =>
    ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'].some(h => url.toLowerCase().includes(h));

const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}?autoplay=1`;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1`;
    if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}?autoplay=1`;
    return url;
};
const getYtThumb = (url: string) => {
    let id = '';
    if (url.includes('youtube.com/watch')) id = new URL(url).searchParams.get('v') || '';
    else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0] || '';
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
};

// ── Native video player ───────────────────────────────────────────────────────
const NativeVideoPlayer: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const close = () => { setIsPlaying(false); videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; };
    return (
        <div className={cn('relative', className)}>
            <button type="button" className="group relative w-full cursor-pointer border-0 bg-transparent p-0" onClick={() => setIsPlaying(true)}>
                <video src={src} className="w-full h-auto max-h-64 object-cover rounded" style={{ aspectRatio: '16/9' }} muted playsInline preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] backdrop-blur-sm">
                        <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                    </div>
                </div>
            </button>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md" onClick={close}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
                                <button onClick={close} className="absolute -top-10 right-0 p-1.5 rounded border border-[rgba(255,255,255,0.1)] text-white/70 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                                <video ref={videoRef} src={src} className="w-full rounded-lg" controls autoPlay playsInline />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>, document.body
            )}
        </div>
    );
};

// ── Severity config ──────────────────────────────────────────────────────────
const severityConf = (level: string | undefined) => {
    if (!level) return { color: '#8899aa', label: 'N/A' };
    const map: Record<string, { color: string; label: string }> = {
        high: { color: '#ff3b3b', label: 'NGUY HIỂM' },
        medium: { color: '#ffd700', label: 'CẢNH BÁO' },
        low: { color: '#00ff88', label: 'THẤP' },
    };
    return map[level] ?? { color: '#8899aa', label: level.toUpperCase() };
};

const verificationConf: Record<VerificationLevel, { label: string; color: string }> = {
    [VerificationLevel.CONFIRMED]: { label: 'CHÍNH XÁC', color: '#00ff88' },
    [VerificationLevel.VERIFIED]: { label: 'ĐÃ XÁC MINH', color: '#00d4ff' },
    [VerificationLevel.PENDING]: { label: 'CHỜ XÁC MINH', color: '#ffd700' },
    [VerificationLevel.UNVERIFIED]: { label: 'CHƯA XÁC MINH', color: '#ff3b3b' },
};

// ── Props ────────────────────────────────────────────────────────────────────
interface ReportCardProps {
    report: VerificationCrimeReport;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onDispute: (id: string) => void;
    onEdit?: (report: VerificationCrimeReport) => void;
    onDelete?: (id: string) => void;
    isConfirming?: boolean;
    isDisputing?: boolean;
}

// ── Main component ───────────────────────────────────────────────────────────
const ReportCard: React.FC<ReportCardProps> = ({
    report, onClose, onConfirm, onDispute, onEdit, onDelete,
    isConfirming = false, isDisputing = false,
}) => {
    const { userId } = useUser();
    const vconf = verificationConf[report.verificationLevel ?? VerificationLevel.UNVERIFIED];
    const sconf = severityConf(report.severityLevel);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null);
    const [loadingVote, setLoadingVote] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    const attachments = report.attachments || [];
    const currentMedia = attachments[currentIdx];
    const isCurrentVideo = currentMedia ? isVideoUrl(currentMedia) : false;
    const imageCount = attachments.filter(u => !isVideoUrl(u)).length;
    const videoCount = attachments.filter(u => isVideoUrl(u)).length;

    useEffect(() => {
        reportService.getVoteStatus(report.id)
            .then(s => setVoteStatus(s))
            .catch(() => setVoteStatus({ hasConfirmed: false, hasDisputed: false, voteCount: 0, canVote: true, isOwner: false }))
            .finally(() => setLoadingVote(false));
    }, [report.id]);

    const prevConfRef = useRef(isConfirming);
    const prevDispRef = useRef(isDisputing);
    useEffect(() => {
        if ((prevConfRef.current && !isConfirming) || (prevDispRef.current && !isDisputing)) {
            reportService.getVoteStatus(report.id).then(s => setVoteStatus(s)).catch(() => {});
        }
        prevConfRef.current = isConfirming;
        prevDispRef.current = isDisputing;
    }, [isConfirming, isDisputing, report.id]);

    const isOwner = useMemo(() => {
        if (voteStatus?.isOwner !== undefined) return voteStatus.isOwner;
        if (userId && report.reporterId) return report.reporterId === userId;
        return false;
    }, [voteStatus?.isOwner, userId, report.reporterId]);

    const canConfirm = voteStatus ? voteStatus.canVote && !voteStatus.hasConfirmed && !isOwner : !isOwner;
    const canDispute = voteStatus ? voteStatus.canVote && !voteStatus.hasDisputed && !isOwner : !isOwner;
    const trustScore = report.trustScore ?? 0;
    const trustColor = trustScore >= 70 ? '#00ff88' : trustScore >= 40 ? '#ffd700' : '#ff3b3b';

    return (
        <div className="fixed md:absolute z-[49] md:z-[45] inset-0 md:inset-auto md:top-20 md:right-4 md:w-80 pointer-events-none md:pointer-events-auto flex items-center justify-center md:block p-4 md:p-0 bg-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
            <div className="relative w-full max-w-sm md:max-w-none pointer-events-auto rounded border border-[rgba(0,212,255,0.18)] bg-[rgba(6,10,20,0.97)] overflow-hidden"
                style={{ backdropFilter: 'blur(20px)', maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                {/* Top accent */}
                <div className="h-px w-full shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${sconf.color}, transparent)`, opacity: 0.5 }} />

                {/* Media gallery */}
                {attachments.length > 0 && (
                    <div className="relative bg-black shrink-0">
                        {isCurrentVideo ? (
                            isEmbeddable(currentMedia)
                                ? <HeroVideoDialog animationStyle="from-center" videoSrc={getEmbedUrl(currentMedia)} thumbnailSrc={getYtThumb(currentMedia)} thumbnailAlt="Video" className="w-full" />
                                : <NativeVideoPlayer src={currentMedia} className="w-full" />
                        ) : (
                            <div className="relative w-full aspect-video max-h-56 overflow-hidden cursor-zoom-in"
                                onClick={e => { e.stopPropagation(); setIsImageExpanded(true); }}>
                                <Image src={currentMedia} alt={`Media ${currentIdx + 1}`} fill className="object-cover" sizes="320px" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
                            </div>
                        )}

                        {/* Top overlay: badge + date */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                            <div className="flex gap-1.5">
                                {imageCount > 0 && <span className="flex items-center gap-1 font-mono text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-sm"><ImageIcon className="h-2.5 w-2.5" />{imageCount}</span>}
                                {videoCount > 0 && <span className="flex items-center gap-1 font-mono text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-sm"><Play className="h-2.5 w-2.5" />{videoCount}</span>}
                            </div>
                            <span className="font-mono text-[9px] bg-black/70 text-[#8899aa] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {/* Nav arrows */}
                        {attachments.length > 1 && (
                            <>
                                <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => i === 0 ? attachments.length - 1 : i - 1); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => i === attachments.length - 1 ? 0 : i + 1); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                    {attachments.map((_, i) => (
                                        <button key={i} onClick={e => { e.stopPropagation(); setCurrentIdx(i); }}
                                            className={cn("w-1.5 h-1.5 rounded-full transition-all", i === currentIdx ? "bg-white scale-125" : "bg-white/40")} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border"
                                    style={{ color: vconf.color, borderColor: `${vconf.color}30`, background: `${vconf.color}10` }}>
                                    {vconf.label}
                                </span>
                                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border"
                                    style={{ color: sconf.color, borderColor: `${sconf.color}30`, background: `${sconf.color}10` }}>
                                    {sconf.label}
                                </span>
                            </div>
                            <h3 className="font-mono text-sm font-bold text-white leading-tight">{report.title}</h3>
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 w-7 h-7 rounded border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#8899aa] hover:text-white hover:border-[rgba(255,59,59,0.4)] transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="px-4 pb-4 space-y-3">
                        {/* Location */}
                        <div className="flex items-start gap-2 px-2.5 py-2 rounded border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.04)]">
                            <MapPin className="h-3.5 w-3.5 text-[#00d4ff]/60 shrink-0 mt-0.5" />
                            <span className="font-mono text-[10px] text-[#8899aa] leading-relaxed">{report.address}</span>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-[9px] font-mono text-[#8899aa]">
                            {report.reporterName && (
                                <span className="flex items-center gap-1">
                                    <User className="h-2.5 w-2.5" />
                                    {report.reporterName}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(report.reportedAt ?? report.createdAt).toLocaleString('vi-VN')}
                            </span>
                        </div>

                        {/* Trust score */}
                        <div className="rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] text-[#8899aa] uppercase tracking-widest">Độ tin cậy</span>
                                <span className="font-mono text-xs font-bold" style={{ color: trustColor }}>{trustScore}/100</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${trustScore}%`, backgroundColor: trustColor }} />
                            </div>
                            <div className="flex justify-between font-mono text-[9px]">
                                <span className="flex items-center gap-1 text-[#00ff88]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                                    {report.confirmationCount ?? 0} xác nhận
                                </span>
                                <span className="flex items-center gap-1 text-[#ff3b3b]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b]" />
                                    {report.disputeCount ?? 0} báo sai
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {report.description && (
                            <p className="font-mono text-[11px] text-[#8899aa] leading-relaxed">{report.description}</p>
                        )}

                        {/* Vote buttons */}
                        {!isOwner && (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => onConfirm(report.id)}
                                    disabled={isConfirming || !canConfirm || loadingVote}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase py-2.5 rounded border transition-all duration-200",
                                        voteStatus?.hasConfirmed
                                            ? "border-[rgba(0,255,136,0.4)] bg-[rgba(0,255,136,0.1)] text-[#00ff88] opacity-70 cursor-not-allowed"
                                            : canConfirm
                                                ? "border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.06)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.12)]"
                                                : "border-[rgba(255,255,255,0.06)] text-[#8899aa] cursor-not-allowed opacity-50"
                                    )}>
                                    {isConfirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                    {isConfirming ? 'Đang xử lý' : voteStatus?.hasConfirmed ? 'Đã xác nhận' : 'Xác nhận'}
                                </button>
                                <button onClick={() => onDispute(report.id)}
                                    disabled={isDisputing || !canDispute || loadingVote}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase py-2.5 rounded border transition-all duration-200",
                                        voteStatus?.hasDisputed
                                            ? "border-[rgba(255,59,59,0.4)] bg-[rgba(255,59,59,0.1)] text-[#ff3b3b] opacity-70 cursor-not-allowed"
                                            : canDispute
                                                ? "border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.06)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.12)]"
                                                : "border-[rgba(255,255,255,0.06)] text-[#8899aa] cursor-not-allowed opacity-50"
                                    )}>
                                    {isDisputing ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
                                    {isDisputing ? 'Đang xử lý' : voteStatus?.hasDisputed ? 'Đã báo sai' : 'Báo sai'}
                                </button>
                            </div>
                        )}

                        {voteStatus && voteStatus.voteCount > 0 && (
                            <p className="font-mono text-[9px] text-[#8899aa]/50 text-center">
                                Đã vote {voteStatus.voteCount}/2 lần{voteStatus.voteCount >= 2 ? ' (đạt giới hạn)' : ''}
                            </p>
                        )}

                        {/* Owner actions */}
                        {isOwner && (onEdit || onDelete) && (
                            <div className="grid grid-cols-2 gap-2">
                                {onEdit && (
                                    <button onClick={() => onEdit(report)}
                                        className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase py-2.5 rounded border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.06)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.12)] transition-colors">
                                        <Pencil className="h-3 w-3" /> Chỉnh sửa
                                    </button>
                                )}
                                {onDelete && (
                                    <button onClick={() => setShowDeleteDialog(true)}
                                        className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase py-2.5 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.06)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.12)] transition-colors">
                                        <Trash2 className="h-3 w-3" /> Xóa
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.15)] to-transparent" />
            </div>

            {/* Delete dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md border-[rgba(255,59,59,0.3)] bg-[rgba(8,12,24,0.98)]" style={{ backdropFilter: 'blur(20px)' }}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-mono text-[#ff3b3b]">
                            <AlertTriangle className="h-4 w-4" /> XÁC NHẬN XÓA
                        </DialogTitle>
                        <DialogDescription className="font-mono text-xs text-[#8899aa]">
                            Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}
                            className="font-mono text-xs border-[rgba(255,255,255,0.1)] text-[#8899aa] bg-transparent hover:text-white">
                            Hủy
                        </Button>
                        <Button onClick={() => { onDelete?.(report.id); setShowDeleteDialog(false); }}
                            className="font-mono text-xs bg-[rgba(255,59,59,0.15)] border border-[rgba(255,59,59,0.4)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.25)] hover:text-white">
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Xóa báo cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image expand portal */}
            {isImageExpanded && !isCurrentVideo && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md cursor-zoom-out"
                        onClick={e => { e.stopPropagation(); setIsImageExpanded(false); }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="relative w-[95vw] h-[90vh] max-w-7xl" onClick={e => e.stopPropagation()}>
                            <Image src={currentMedia} alt="Expanded" fill className="object-contain rounded-lg" sizes="95vw" priority />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>, document.body
            )}
        </div>
    );
};

export default ReportCard;
