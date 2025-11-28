'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import { X, MapPin, Check, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import reportService, { VoteStatus } from '@/service/report.service';
import { useUser } from '@/hooks/use-user';

// Helper to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];

    const lowerUrl = url.toLowerCase();

    if (videoExtensions.some(ext => lowerUrl.includes(ext))) return true;
    if (videoHosts.some(host => lowerUrl.includes(host))) return true;

    return false;
};

// Helper to check if video is embeddable (YouTube, Vimeo, etc.)
const isEmbeddableVideo = (url: string): boolean => {
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    return videoHosts.some(host => url.toLowerCase().includes(host));
};

// Helper to get video embed URL
const getVideoEmbedUrl = (url: string): string => {
    // YouTube
    if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
};

// Helper to get video thumbnail for embeddable videos
const getVideoThumbnail = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
            videoId = new URL(url).searchParams.get('v') || '';
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '';
};

// Native video player component for direct video files
const NativeVideoPlayer: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleClose = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div className={cn("relative", className)}>
            {/* Thumbnail/Preview */}
            <button
                type="button"
                className="group relative w-full cursor-pointer border-0 bg-transparent p-0"
                onClick={() => setIsPlaying(true)}
            >
                <video
                    src={src}
                    className="w-full h-auto max-h-72 object-cover rounded-md"
                    style={{ aspectRatio: '16 / 9' }}
                    muted
                    playsInline
                    preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-md">
                    <div className="bg-primary/90 flex size-14 items-center justify-center rounded-full backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="size-6 fill-white text-white ml-1" />
                    </div>
                </div>
            </button>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleClose}
                                className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                            <video
                                ref={videoRef}
                                src={src}
                                className="w-full rounded-xl"
                                controls
                                autoPlay
                                playsInline
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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

const badgeByLevel: Record<VerificationLevel, { label: string; classes: string }> = {
    [VerificationLevel.CONFIRMED]: {
        label: 'CHÍNH XÁC',
        classes: 'bg-green-100 text-green-700 border border-green-200',
    },
    [VerificationLevel.VERIFIED]: {
        label: 'ĐÃ XÁC MINH',
        classes: 'bg-blue-100 text-blue-700 border border-blue-200',
    },
    [VerificationLevel.PENDING]: {
        label: 'CHỜ XÁC MINH',
        classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    },
    [VerificationLevel.UNVERIFIED]: {
        label: 'CHƯA XÁC MINH',
        classes: 'bg-red-100 text-red-700 border border-red-200',
    },
};

const scoreColor = (score: number | undefined) => {
    if ((score ?? 0) >= 85) return 'bg-blue-500';
    if ((score ?? 0) >= 70) return 'bg-green-500';
    if ((score ?? 0) >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
};

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    onClose,
    onConfirm,
    onDispute,
    onEdit,
    onDelete,
    isConfirming = false,
    isDisputing = false,
}) => {
    const { userId } = useUser();
    const badge = badgeByLevel[report.verificationLevel ?? VerificationLevel.UNVERIFIED];
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null);
    const [loadingVoteStatus, setLoadingVoteStatus] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    const attachments = report.attachments || [];
    const hasMultipleMedia = attachments.length > 1;
    const currentMedia = attachments[currentMediaIndex];
    const isCurrentVideo = currentMedia ? isVideoUrl(currentMedia) : false;
    const isCurrentEmbeddable = currentMedia ? isEmbeddableVideo(currentMedia) : false;

    // Fetch vote status
    useEffect(() => {
        const fetchVoteStatus = async () => {
            try {
                setLoadingVoteStatus(true);
                const status = await reportService.getVoteStatus(report.id);
                setVoteStatus(status);
            } catch (error) {
                // If error (e.g., not authenticated), set default
                setVoteStatus({
                    hasConfirmed: false,
                    hasDisputed: false,
                    voteCount: 0,
                    canVote: true,
                    isOwner: false,
                });
            } finally {
                setLoadingVoteStatus(false);
            }
        };

        fetchVoteStatus();
    }, [report.id]);

    // Refresh vote status after successful vote
    const prevIsConfirmingRef = useRef(isConfirming);
    const prevIsDisputingRef = useRef(isDisputing);

    useEffect(() => {
        // Refresh when vote action completes (transitions from true to false)
        if (
            (prevIsConfirmingRef.current && !isConfirming) ||
            (prevIsDisputingRef.current && !isDisputing)
        ) {
            const refreshVoteStatus = async () => {
                try {
                    const status = await reportService.getVoteStatus(report.id);
                    setVoteStatus(status);
                } catch (error) {
                    // Silently fail
                }
            };
            refreshVoteStatus();
        }

        prevIsConfirmingRef.current = isConfirming;
        prevIsDisputingRef.current = isDisputing;
    }, [isConfirming, isDisputing, report.id]);

    // Check if user is owner - use both voteStatus.isOwner and direct comparison
    const isOwner = useMemo(() => {
        // Primary check: from API vote status
        if (voteStatus?.isOwner !== undefined) {
            return voteStatus.isOwner;
        }
        // Fallback check: compare reporterId with userId
        if (userId && report.reporterId) {
            return report.reporterId === userId;
        }
        return false;
    }, [voteStatus?.isOwner, userId, report.reporterId]);

    // Calculate if buttons should be disabled
    const canConfirm = voteStatus
        ? voteStatus.canVote && !voteStatus.hasConfirmed && !isOwner
        : !isOwner; // If no vote status, check ownership only
    const canDispute = voteStatus
        ? voteStatus.canVote && !voteStatus.hasDisputed && !isOwner
        : !isOwner; // If no vote status, check ownership only

    const goToPrevious = () => {
        setCurrentMediaIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentMediaIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
    };

    // Count images and videos
    const imageCount = attachments.filter(url => !isVideoUrl(url)).length;
    const videoCount = attachments.filter(url => isVideoUrl(url)).length;

    return (
        <div className="fixed md:absolute z-49 md:z-45 inset-0 md:inset-auto md:top-20 md:right-4 md:w-80 pointer-events-none md:pointer-events-auto flex items-center justify-center md:block p-4 md:p-0 bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
            <Card className="w-full max-w-sm md:max-w-none max-h-full shadow-2xl pointer-events-auto animate-in zoom-in-95 p-1 gap-1 ">
                {attachments.length ? (
                    <div className="w-full overflow-hidden rounded-t-lg bg-muted">
                        <div className="relative w-full">
                            {isCurrentVideo ? (
                                isCurrentEmbeddable ? (
                                    // YouTube, Vimeo, etc. - use HeroVideoDialog with iframe
                                    <HeroVideoDialog
                                        animationStyle="from-center"
                                        videoSrc={getVideoEmbedUrl(currentMedia)}
                                        thumbnailSrc={getVideoThumbnail(currentMedia)}
                                        thumbnailAlt="Video bằng chứng"
                                        className="w-full"
                                    />
                                ) : (
                                    // Direct video files (.mp4, .webm, etc.) - use native player
                                    <NativeVideoPlayer
                                        src={currentMedia}
                                        className="w-full"
                                    />
                                )
                            ) : (
                                <img
                                    src={currentMedia}
                                    alt={`Bằng chứng ${currentMediaIndex + 1}`}
                                    className="w-full h-auto max-h-72 object-cover rounded-md cursor-zoom-in"
                                    style={{ aspectRatio: '16 / 9' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsImageExpanded(true);
                                    }}
                                />
                            )}

                            {/* Navigation arrows for multiple media */}
                            {hasMultipleMedia && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white border-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white border-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            )}

                            {/* Top badges row */}
                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                {/* Media counts */}
                                <div className="flex gap-1.5">
                                    {imageCount > 0 && (
                                        <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] px-1.5">
                                            <ImageIcon className="h-3 w-3 mr-1" />
                                            {imageCount}
                                        </Badge>
                                    )}
                                    {videoCount > 0 && (
                                        <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] px-1.5">
                                            <Play className="h-3 w-3 mr-1" />
                                            {videoCount}
                                        </Badge>
                                    )}
                                </div>

                                {/* Date badge */}
                                <Badge variant="secondary" className="bg-black/60 text-white border-0">
                                    {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                </Badge>
                            </div>

                            {/* Dots indicator */}
                            {hasMultipleMedia && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {attachments.map((url, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(index); }}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                index === currentMediaIndex
                                                    ? "bg-white scale-110"
                                                    : "bg-white/50 hover:bg-white/70"
                                            )}
                                            aria-label={`Xem ${isVideoUrl(url) ? 'video' : 'ảnh'} ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                <div className=' overflow-y-auto max-h-80 '>

                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1.5">
                                <Badge className={`text-xs font-bold ${badge.classes}`}>
                                    {badge.label}
                                </Badge>
                                <h3 className="font-bold text-lg leading-tight">{report.title}</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="">{report.address}</span>
                        </div>

                        <div className="p-3 rounded-lg border bg-card shadow-sm space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Độ tin cậy</span>
                                <span className={cn((report.trustScore ?? 0) >= 70 ? 'text-green-600' : 'text-muted-foreground')}>
                                    {report.trustScore ?? 0}/100
                                </span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div
                                    className={cn('h-full transition-all duration-700 ease-out', scoreColor(report.trustScore))}
                                    style={{ width: `${report.trustScore ?? 0}%` }}
                                />
                            </div>
                            <Separator />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {report.confirmationCount ?? 0} Xác nhận
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {report.disputeCount ?? 0} Báo sai
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>

                        {/* Vote buttons - hidden for owner */}
                        {!isOwner && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => onConfirm(report.id)}
                                    disabled={isConfirming || !canConfirm || loadingVoteStatus}
                                    className="w-full"
                                    title={
                                        voteStatus?.hasConfirmed
                                            ? 'Bạn đã xác nhận báo cáo này rồi'
                                            : !voteStatus?.canVote
                                                ? 'Bạn đã vote tối đa 2 lần cho báo cáo này'
                                                : undefined
                                    }
                                >
                                    {isConfirming ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Check className="h-4 w-4 mr-2" />
                                    )}
                                    {isConfirming
                                        ? 'Đang xử lý...'
                                        : voteStatus?.hasConfirmed
                                            ? 'Đã xác nhận'
                                            : 'Xác thực'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onDispute(report.id)}
                                    disabled={isDisputing || !canDispute || loadingVoteStatus}
                                    className="w-full"
                                    title={
                                        voteStatus?.hasDisputed
                                            ? 'Bạn đã báo sai báo cáo này rồi'
                                            : !voteStatus?.canVote
                                                ? 'Bạn đã vote tối đa 2 lần cho báo cáo này'
                                                : undefined
                                    }
                                >
                                    {isDisputing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                    )}
                                    {isDisputing
                                        ? 'Đang xử lý...'
                                        : voteStatus?.hasDisputed
                                            ? 'Đã báo sai'
                                            : 'Báo sai'}
                                </Button>
                            </div>
                        )}

                        {/* Vote status indicator */}
                        {voteStatus && voteStatus.voteCount > 0 && (
                            <div className="text-xs text-muted-foreground text-center pt-0.5">
                                Bạn đã vote {voteStatus.voteCount}/2 lần
                                {voteStatus.voteCount >= 2 && ' (đã đạt giới hạn)'}
                            </div>
                        )}

                        {/* Owner actions - Edit and Delete */}
                        {isOwner && (onEdit || onDelete) && (
                            <div className="grid grid-cols-2 gap-3">
                                {onEdit && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onEdit(report)}
                                        className="w-full"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="w-full"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Xóa báo cáo
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>

                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Xác nhận xóa báo cáo
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete?.(report.id);
                                setShowDeleteDialog(false);
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa báo cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Overlay */}
            <AnimatePresence>
                {isImageExpanded && !isCurrentVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsImageExpanded(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-[95vw] max-h-[95vh] p-1 overflow-hidden"
                        >
                            <img
                                src={currentMedia}
                                alt="Zoomed preview"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportCard;
