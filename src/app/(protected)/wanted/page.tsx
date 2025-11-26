'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Search, RefreshCw, MapPin, Users } from 'lucide-react';
import { useWantedCriminals } from '@/hooks/use-wanted-criminals';
import type { WantedCriminalResponse } from '@/service/wanted-criminal.service';

const formatDate = (value?: string | Date) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('vi-VN');
};

const ITEMS_PER_PAGE = 9;

export default function WantedPage() {
    const { data, isLoading, error, refetch, isFetching } = useWantedCriminals();
    const [search, setSearch] = useState('');
    const [crimeFilter, setCrimeFilter] = useState('');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const crimes = useMemo(() => {
        const unique = new Set<string>();
        data?.forEach((item) => unique.add(item.crime));
        return Array.from(unique);
    }, [data]);

    const filteredList = useMemo(() => {
        if (!data) return [];
        return data.filter((item) => {
            const query = search.toLowerCase();
            const matchesQuery =
                !query ||
                item.name.toLowerCase().includes(query) ||
                item.crime.toLowerCase().includes(query) ||
                item.address?.toLowerCase().includes(query) ||
                item.decisionNumber?.toLowerCase().includes(query);
            const matchesCrime = !crimeFilter || item.crime === crimeFilter;
            return matchesQuery && matchesCrime;
        });
    }, [data, search, crimeFilter]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [search, crimeFilter]);

    const displayedList = useMemo(() => filteredList.slice(0, visibleCount), [filteredList, visibleCount]);
    const hasMore = filteredList.length > visibleCount;

    const handleLoadMore = useCallback(() => {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // Infinite scroll: tự động load thêm khi sentinel vào viewport
    useEffect(() => {
        if (!hasMore || isLoading || isFetching) return;
        const el = loadMoreRef.current;
        if (!el) return;

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                handleLoadMore();
            }
        }, { root: null, rootMargin: '0px', threshold: 1.0 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoading, isFetching, handleLoadMore]);

    const renderCriminalCard = (criminal: WantedCriminalResponse) => {
        return (
            <div
                key={criminal.id}
                className="flex gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-amber-50 bg-white"
            >
                <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold sm:text-sm">{criminal.name}</p>
                        <Badge variant="secondary" className="text-xs shrink-0">
                            Sinh {criminal.birthYear}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Tội danh: {criminal.crime}</p>
                    <p className="text-xs text-muted-foreground">
                        Đơn vị: {criminal.issuingUnit ?? 'Đang cập nhật'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {criminal.address ?? 'Chưa rõ'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Cập nhật: {formatDate(criminal.createdAt)}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* Thêm padding container */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Danh sách truy nã</h1>

                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>
            </div>

            <Card className="border border-border/70 shadow-sm">
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm tên, tội danh, địa chỉ..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={crimeFilter}
                                onChange={(e) => setCrimeFilter(e.target.value)}
                            >
                                <option value="">Tất cả tội danh</option>
                                {crimes.map((crime) => (
                                    <option key={crime} value={crime}>
                                        {crime}
                                    </option>
                                ))}
                            </select>
                            {crimeFilter && (
                                <Button variant="ghost" onClick={() => setCrimeFilter('')}>
                                    Xóa
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Tổng cộng:{' '}
                        <span className="font-medium text-foreground">
                            {filteredList.length.toLocaleString('vi-VN')} đối tượng
                        </span>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Spinner className="h-6 w-6" />
                </div>
            ) : filteredList.length ? (
                <div className="space-y-4">
                    <div className=" flex flex-col gap-4 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {displayedList.map(renderCriminalCard)}
                    </div>
                    {hasMore && (
                        <div ref={loadMoreRef} className="flex justify-center py-4">
                            <Spinner className="h-5 w-5" />
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Không tìm thấy đối tượng phù hợp với từ khóa của bạn.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}