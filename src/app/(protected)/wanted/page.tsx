'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Search, RefreshCw, MapPin, Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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

    const handleSearchChange = (value: string) => {
        setSearch(value);
        const id = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 500);
        return () => clearTimeout(id);
    };

    const { data: paginatedData, isLoading, error, refetch, isFetching } = useWantedCriminals({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
    });

    const criminals = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    const totalItems = paginatedData?.total || 0;

    const renderCard = (criminal: WantedCriminalResponse) => (
        <div key={criminal.id}
            className="group relative flex gap-3 rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(12,17,32,0.7)] p-3 md:p-4 transition-all duration-200 hover:border-[rgba(255,59,59,0.3)] overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff3b3b] opacity-0 group-hover:opacity-60 transition-opacity rounded-l" />

            <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded bg-[rgba(255,59,59,0.08)] border border-[rgba(255,59,59,0.15)] flex items-center justify-center">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-[#ff3b3b]/50" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-white truncate">{criminal.name}</p>
                    <span className="font-mono text-[9px] text-[#ff3b3b]/60 shrink-0 border border-[rgba(255,59,59,0.2)] px-1.5 py-0.5 rounded">
                        {criminal.birthYear}
                    </span>
                </div>
                <p className="font-mono text-[10px] text-[#ffd700]/70 truncate">
                    {criminal.crime}
                </p>
                <p className="font-mono text-[10px] text-[#8899aa] truncate">
                    {criminal.issuingUnit ?? 'Updating'}
                </p>
                <p className="flex items-center gap-1 font-mono text-[10px] text-[#8899aa] truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-[#00d4ff]/50" />
                    {criminal.address ?? 'Unknown'}
                </p>
                <p className="font-mono text-[9px] text-[#8899aa]/40">
                    Updated: {formatDate(criminal.createdAt)}
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full bg-[#ff3b3b]" />
                        <h1 className="font-mono text-xl font-bold text-white tracking-wide uppercase">
                            Wanted Criminals List
                        </h1>
                    </div>
                    <p className="font-mono text-[10px] text-[#8899aa] pl-3">
                        Data from{' '}
                        <a href="https://truyna.bocongan.gov.vn" target="_blank" rel="noopener noreferrer"
                            className="text-[#00d4ff] hover:text-white transition-colors">
                            Ministry of Public Security
                        </a>
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}
                    className="flex items-center gap-2 font-mono text-xs border-[rgba(0,212,255,0.2)] text-[#8899aa] hover:text-white hover:border-[rgba(0,212,255,0.4)] bg-transparent">
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Search bar */}
            <div className="rounded border border-[rgba(0,212,255,0.12)] bg-[rgba(12,17,32,0.6)] p-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8899aa]" />
                    <Input placeholder="Search name, crime, address..."
                        className="pl-9 font-mono text-sm bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.15)] focus-visible:border-[#00d4ff] focus-visible:ring-0 text-white placeholder:text-[#8899aa]/50"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)} />
                </div>
                <p className="font-mono text-[10px] text-[#8899aa]">
                    Total:{' '}
                    <span className="text-[#00d4ff] font-bold">
                        {totalItems.toLocaleString('vi-VN')} subjects
                    </span>
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.08)] px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-[#ff3b3b] shrink-0" />
                    <span className="font-mono text-xs text-[#ff3b3b]">{error.message}</span>
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center space-y-3">
                        <Spinner className="h-6 w-6 mx-auto text-[#00d4ff]" />
                        <p className="font-mono text-[10px] text-[#8899aa] tracking-widest uppercase">Loading...</p>
                    </div>
                </div>
            ) : criminals.length > 0 ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {criminals.map(renderCard)}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 py-2">
                            <Button variant="outline" size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                                className="font-mono text-xs border-[rgba(0,212,255,0.2)] text-[#8899aa] hover:text-white hover:border-[rgba(0,212,255,0.4)] bg-transparent">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-mono text-xs text-[#8899aa]">
                                Page <span className="text-white font-bold">{page}</span> / {totalPages}
                            </span>
                            <Button variant="outline" size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isFetching}
                                className="font-mono text-xs border-[rgba(0,212,255,0.2)] text-[#8899aa] hover:text-white hover:border-[rgba(0,212,255,0.4)] bg-transparent">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(12,17,32,0.6)] py-16 text-center">
                    <Users className="h-8 w-8 mx-auto text-[#8899aa]/30 mb-3" />
                    <p className="font-mono text-xs text-[#8899aa]">No matching subjects found.</p>
                </div>
            )}
        </div>
    );
}
