'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useWeatherNews } from '@/hooks/use-weather-news';
import { WeatherNewsType, WeatherNewsResponse } from '@/service/weather-news.service';
import { Calendar, MapPin, RefreshCw, Search, AlertTriangle, CloudDrizzle } from 'lucide-react';

const typeMeta: Record<
    WeatherNewsType,
    { label: string; description: string; color: string; icon: React.ElementType }
> = {
    [WeatherNewsType.DISASTER_WARNING]: {
        label: 'Cảnh báo thiên tai',
        description: 'Các cảnh báo bão, lũ, sạt lở...',
        color: 'bg-red-100 text-red-700',
        icon: AlertTriangle,
    },
    [WeatherNewsType.WEATHER_FORECAST]: {
        label: 'Dự báo khí tượng',
        description: 'Thông tin dự báo thời tiết, thủy văn',
        color: 'bg-blue-100 text-blue-700',
        icon: CloudDrizzle,
    },
};

const formatDateTime = (value?: string | Date) => {
    if (!value) return 'Không rõ thời gian';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function WeatherPage() {
    const [activeType, setActiveType] = useState<WeatherNewsType | undefined>(undefined);
    const [search, setSearch] = useState('');

    const { data, isLoading, error, refetch, isFetching } = useWeatherNews(activeType);

    const filteredNews = useMemo(() => {
        if (!data) return [];
        const keyword = search.trim().toLowerCase();
        if (!keyword) return data;
        return data.filter((item) => {
            return (
                item.title.toLowerCase().includes(keyword) ||
                item.summary?.toLowerCase().includes(keyword) ||
                item.location?.toLowerCase().includes(keyword) ||
                item.severity?.toLowerCase().includes(keyword)
            );
        });
    }, [data, search]);

    const renderNewsCard = (news: WeatherNewsResponse) => {
        const meta = typeMeta[news.type];
        const Icon = meta.icon;
        return (
            <Card key={news.id} className="border border-border/70 overflow-hidden">
                {news.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                )}
                <CardHeader className="pb-3 space-y-3">
                    <div className="flex flex-col gap-2">
                        <Badge className={`${meta.color} shrink-0 w-fit flex items-center gap-1`}>
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                    <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
                    {news.summary && <CardDescription className="text-sm">{news.summary}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {news.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{news.location}</span>
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Đăng: {formatDateTime(news.publishedDate ?? news.createdAt)}</span>
                        </div>
                        {news.nextUpdateAt && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Lần cập nhật tiếp theo: {formatDateTime(news.nextUpdateAt)}</span>
                            </div>
                        )}
                    </div>
                    {news.severity && (
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Mức độ: {news.severity}</span>
                        </div>
                    )}
                    {news.content && (
                        <p className="text-sm text-muted-foreground/90 line-clamp-4 whitespace-pre-line">{news.content}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-border/60">
                        <span className="text-xs text-muted-foreground break-all">
                            Nguồn: {news.sourceUrl ?? 'Chưa rõ'}
                        </span>
                        {news.sourceUrl && (
                            <Button variant="outline" size="sm" asChild className="shrink-0">
                                <a href={news.sourceUrl} target="_blank" rel="noreferrer">
                                    Xem chi tiết
                                </a>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Thiên Tai & Khí Tượng</h1>
                    <p className="text-sm text-muted-foreground">
                        Đồng bộ dữ liệu từ Trung tâm dự báo khí tượng thủy văn quốc gia
                    </p>
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

            <Card className="border border-border/70">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-4">
                        {/* Mobile: Select (chỉ hiển thị 1 tab) */}
                        <div className="md:hidden">
                            <Select
                                value={activeType ?? 'all'}
                                onValueChange={(value: string) => {
                                    setActiveType(value === 'all' ? undefined : (value as WeatherNewsType));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue>
                                        {activeType === undefined
                                            ? 'Tất cả'
                                            : activeType === WeatherNewsType.DISASTER_WARNING
                                                ? 'Cảnh báo thiên tai'
                                                : 'Dự báo khí tượng'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value={WeatherNewsType.DISASTER_WARNING}>Cảnh báo thiên tai</SelectItem>
                                    <SelectItem value={WeatherNewsType.WEATHER_FORECAST}>Dự báo khí tượng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Desktop: Tabs (3 tabs ngang) */}
                        <div className="hidden md:block">
                            <Tabs
                                value={activeType ?? 'all'}
                                onValueChange={(value: string) => {
                                    setActiveType(value === 'all' ? undefined : (value as WeatherNewsType));
                                }}
                                className="w-full"
                            >
                                <TabsList className="w-full grid grid-cols-3">
                                    <TabsTrigger value="all" className="text-sm">Tất cả</TabsTrigger>
                                    <TabsTrigger value={WeatherNewsType.DISASTER_WARNING} className="text-sm">
                                        Cảnh báo thiên tai
                                    </TabsTrigger>
                                    <TabsTrigger value={WeatherNewsType.WEATHER_FORECAST} className="text-sm">
                                        Dự báo khí tượng
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tiêu đề, địa điểm, mức độ..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Tổng cộng:{' '}
                        <span className="font-medium text-foreground">
                            {filteredNews.length.toLocaleString('vi-VN')} bản tin
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
            ) : filteredNews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredNews.map(renderNewsCard)}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Không tìm thấy bản tin phù hợp.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

