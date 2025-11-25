'use client';

import React from 'react';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, MapPin, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
    report: VerificationCrimeReport;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onDispute: (id: string) => void;
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
    isConfirming = false,
    isDisputing = false,
}) => {
    const badge = badgeByLevel[report.verificationLevel ?? VerificationLevel.UNVERIFIED];

    return (
        <div className="fixed md:absolute z-2000 md:z-1000 inset-0 md:inset-auto md:top-16 md:right-4 md:w-80 pointer-events-none md:pointer-events-auto flex items-center justify-center md:block p-4 md:p-0 bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
            <Card className="w-full max-w-sm md:max-w-none shadow-2xl pointer-events-auto animate-in zoom-in-95 p-1 gap-1">
                {report.attachments?.length ? (
                    <div className="w-full overflow-hidden rounded-t-lg bg-muted">
                        <div className="relative w-full max-h-72">
                            <img
                                src={report.attachments[0]}
                                alt="evidence"
                                className="w-full h-auto max-h-72 object-cover"
                                style={{ aspectRatio: '16 / 9' }}
                            />
                            <Badge variant="secondary" className="absolute top-2 right-2 bg-black/60 text-white border-0">
                                {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                            </Badge>
                        </div>
                    </div>
                ) : null}

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
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
                        <span className="line-clamp-1">{report.address}</span>
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

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => onConfirm(report.id)}
                            disabled={isConfirming}
                            className="w-full"
                        >
                            {isConfirming ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            {isConfirming ? 'Đang xử lý...' : 'Xác thực'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onDispute(report.id)}
                            disabled={isDisputing}
                            className="w-full"
                        >
                            {isDisputing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 mr-2" />
                            )}
                            {isDisputing ? 'Đang xử lý...' : 'Báo sai'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportCard;
