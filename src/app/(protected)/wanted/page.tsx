'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Search, RefreshCw, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWantedCriminals } from '@/hooks/use-wanted-criminals';
import type { WantedCriminalResponse } from '@/service/wanted-criminal.service';

const formatDate = (value?: string | Date) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('vi-VN');
};

const ITEMS_PER_PAGE = 9;

export default function WantedPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data: paginatedData, isLoading, error, refetch, isFetching } = useWantedCriminals({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
    });

    const criminals = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    const totalItems = paginatedData?.total || 0;

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
        <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Danh sách truy nã</h1>
                    <h2>Dữ liệu được lấy trực tiếp từ <a href='https://truyna.bocongan.gov.vn' target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bộ Công An</a></h2>
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
                <CardContent className="space-y-4 pt-6">
                    <div className="grid gap-4 md:grid-cols-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm tên, tội danh, địa chỉ..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Tổng cộng:{' '}
                        <span className="font-medium text-foreground">
                            {totalItems.toLocaleString('vi-VN')} đối tượng
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
            ) : criminals.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {criminals.map(renderCriminalCard)}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">
                                Trang {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isFetching}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
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