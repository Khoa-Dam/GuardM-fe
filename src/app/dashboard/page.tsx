'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
    Users,
    FileWarning,
    AlertTriangle,
    Shield,
    Eye,
    Bell,
    Globe,
    ShieldCheck,
    MapPin,
} from 'lucide-react';

import { HomeWantedCriminal } from '@/service/home.service';
import { useHomeData } from '@/hooks/use-home-data';
import { useStatistics, useHeatmap } from '@/hooks/use-statistics';

// Lazy load charts
const CrimeTypePieChart = dynamic(() => import('./components/CrimeTypePieChart'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center"><Spinner className="h-6 w-6 text-muted-foreground" /></div>
});

const DistrictBarChart = dynamic(() => import('./components/DistrictBarChart'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center"><Spinner className="h-6 w-6 text-muted-foreground" /></div>
});

const systemNotices = [
    {
        id: 1,
        title: 'Không có cập nhật nào gần đây',
        content: '',
        type: 'info',
    },
];

const typeColors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

const crimeTypeLabels: Record<string, string> = {
    truy_na: 'Truy nã',
    nghi_pham: 'Nghi phạm',
    dang_ngo: 'Đáng ngờ',
    de_doa: 'Đe dọa',
    giet_nguoi: 'Giết người',
    bat_coc: 'Bắt cóc',
    cuop_giat: 'Cướp giật',
    trom_cap: 'Trộm cắp',
};

const severityBadgeClass: Record<'low' | 'medium' | 'high', string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
};

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString('vi-VN');
};

const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
};

interface SummaryCard {
    title: string;
    value?: number;
    description: string;
    icon: LucideIcon;
}

export default function DashboardPage() {
    // Use React Query hooks for caching
    const { data: homeData, isLoading: homeLoading, error: homeError } = useHomeData();
    const { data: statistics, isLoading: statsLoading, error: statsError } = useStatistics();
    const { data: heatmapData = [], isLoading: heatmapLoading, error: heatmapError } = useHeatmap();

    const loading = homeLoading || statsLoading || heatmapLoading;
    const error = homeError?.message || statsError?.message || heatmapError?.message || null;

    const summaryCards = useMemo<SummaryCard[]>(
        () => [
            {
                title: 'Tổng báo cáo',
                value: statistics?.total,
                description: 'Báo cáo đã ghi nhận',
                icon: FileWarning,
            },
            {
                title: 'Báo cáo đang hoạt động',
                value: statistics?.activeAlerts,
                description: 'Status = 0',
                icon: AlertTriangle,
            },
            {
                title: 'Báo cáo mức độ cao',
                value: statistics?.highSeverity,
                description: 'Severity ≥ 4',
                icon: ShieldCheck,
            },
            {
                title: 'Đối tượng truy nã',
                value: homeData?.statistics.totalWanted,
                description: 'Từ nguồn dữ liệu thực',
                icon: Users,
            },
        ],
        [statistics, homeData]
    );

    const crimeTypeData = useMemo(
        () =>
            (statistics?.byType ?? []).map((item) => ({
                label: crimeTypeLabels[item.type] ?? item.type,
                count: item.count,
            })),
        [statistics]
    );

    const topDistricts = useMemo(
        () => (statistics?.byDistrict ?? []).slice(0, 6),
        [statistics]
    );

    const heatmapHighlights = useMemo(() => heatmapData.slice(0, 6), [heatmapData]);
    const recentWanted = homeData?.recentWantedCriminals ?? [];
    const displayedWanted = recentWanted.slice(0, 6);

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl md:text-2xl font-bold min-h-6 flex items-center">
                                    {loading ? <Spinner className="h-5 w-5 text-muted-foreground" /> : formatNumber(stat.value)}
                                </div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="pb-3 ">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                                    Đối tượng truy nã mới nhất
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm"></CardDescription>

                            </div>
                            <Link href="/wanted" className="text-sm text-primary hover:underline">
                                Xem tất cả
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <Spinner className="h-8 w-8 text-muted-foreground" />
                                </div>
                            ) : (
                                displayedWanted.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-amber-50"
                                    >
                                        <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                            <Users className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-sm ">{person.name}</p>
                                                <Badge variant="secondary" className="text-xs shrink-0">
                                                    Sinh {person.birthYear}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground ">Tội danh: {person.crime}</p>
                                            <p className="text-xs text-muted-foreground ">
                                                Đơn vị: {person.issuingUnit ?? 'Đang cập nhật'}
                                            </p>
                                            <p className="text-xs text-muted-foreground ">
                                                <MapPin className="inline h-3 w-3 mr-1" />
                                                {person.address ?? 'Chưa rõ'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">Cập nhật: {formatDate(person.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:gap-6 grid-cols-1">
                    <Card>
                        <CardHeader className="pb-3 ">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                                Thống kê báo cáo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 lg:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Theo loại tội phạm</p>
                                <div className="h-64">
                                    <CrimeTypePieChart data={crimeTypeData} colors={typeColors} />
                                </div>
                                {crimeTypeData.length ? (
                                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        {crimeTypeData.map((item, index) => (
                                            <span key={item.label} className="flex items-center gap-1">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: typeColors[index % typeColors.length] }}
                                                />
                                                {item.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Top quận/huyện</p>
                                <div className="h-64">
                                    <DistrictBarChart data={topDistricts} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3 ">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Globe className="h-4 w-4 md:h-5 md:w-5" />
                                Điểm nóng (Heatmap)
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">
                                Chú thích màu:
                            </CardDescription>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    Nguy hiểm (đỏ)
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    Cảnh báo (vàng)
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    Ổn định (xanh)
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {heatmapHighlights.length ? (
                                <div className="space-y-3 md:space-y-4">
                                    {heatmapHighlights.map((point, index) => (
                                        <div
                                            key={`${point.district}-${point.crimeType}-${index}`}
                                            className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">
                                                    {point.district || point.province || 'Không xác định'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {crimeTypeLabels[point.crimeType] ?? point.crimeType} ·{' '}
                                                    {point.count.toLocaleString('vi-VN')} báo cáo
                                                </p>
                                            </div>
                                            <Badge className={`${severityBadgeClass[point.severity]} text-xs`}>
                                                {point.severity === 'high' ? 'Nguy hiểm' : point.severity === 'medium' ? 'Cảnh báo' : 'Ổn định'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Chưa có dữ liệu heatmap.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 ">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                                Thông báo hệ thống
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Các thông báo quan trọng</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 md:space-y-4">
                                {systemNotices.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className={`rounded-lg border p-3 md:p-4 ${notice.type === 'warning'
                                            ? 'border-amber-500/50 bg-amber-50'
                                            : 'border-blue-500/50 '
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {notice.type === 'warning' ? (
                                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                            ) : (
                                                <Bell className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                            )}
                                            <div className="space-y-1 min-w-0">
                                                <p className="font-medium text-sm">{notice.title}</p>
                                                <p className="text-xs md:text-sm text-muted-foreground">{notice.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}