'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Database, CloudRain, RefreshCw } from 'lucide-react';
import {
    useScraperStatusQuery,
    useTriggerWantedCriminalsScraper,
    useTriggerWeatherNewsScraper,
} from '@/hooks/use-scraper';
import { ScraperCard } from '../components/ScraperCard';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminScraperPage() {
    const { data: scraperStatus, isLoading, refetch } = useScraperStatusQuery();
    const triggerWantedCriminalsMutation = useTriggerWantedCriminalsScraper();
    const triggerWeatherNewsMutation = useTriggerWeatherNewsScraper();

    const [wantedCriminalsPages, setWantedCriminalsPages] = useState(5);
    const [wantedCriminalsLimit, setWantedCriminalsLimit] = useState<number | undefined>(undefined);

    const handleTriggerWantedCriminals = async () => {
        try {
            const result = await triggerWantedCriminalsMutation.mutateAsync({ 
                pages: wantedCriminalsPages,
                limit: wantedCriminalsLimit
            });
            toast.success(result.message || `Đã scrape ${result.count} đối tượng truy nã`);
        } catch (err: any) {
            toast.error(err?.message || 'Không thể kích hoạt scraper');
        }
    };

    const handleTriggerWeatherNews = async () => {
        try {
            const result = await triggerWeatherNewsMutation.mutateAsync();
            toast.success(
                result.message ||
                    `Đã scrape ${result.count} tin thời tiết (${result.imported} mới, ${result.updated} cập nhật)`
            );
        } catch (err: any) {
            toast.error(err?.message || 'Không thể kích hoạt scraper');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Scraper</h1>
                    <p className="text-muted-foreground">
                        Kích hoạt và theo dõi các scraper tự động
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Wanted Criminals Scraper */}
                <div className="space-y-4">
                    <ScraperCard
                        title="Đối tượng truy nã"
                        description="Scrape danh sách truy nã từ Bộ Công An"
                        status={scraperStatus?.wantedCriminals}
                        onTrigger={handleTriggerWantedCriminals}
                        isTriggering={triggerWantedCriminalsMutation.isPending}
                        icon={<Database className="w-6 h-6" />}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Cấu hình</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pages">Số trang scrape (Mặc định: 5)</Label>
                                    <Input
                                        id="pages"
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={wantedCriminalsPages}
                                        onChange={(e) => setWantedCriminalsPages(Number(e.target.value))}
                                        disabled={!!wantedCriminalsLimit}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Mỗi trang chứa khoảng 30 đối tượng
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="limit">Giới hạn số lượng (Tùy chọn)</Label>
                                    <Input
                                        id="limit"
                                        type="number"
                                        min={1}
                                        placeholder="Nhập số lượng giới hạn (VD: 100)"
                                        value={wantedCriminalsLimit || ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? Number(e.target.value) : undefined;
                                            setWantedCriminalsLimit(val);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nếu nhập giới hạn, số trang sẽ bị bỏ qua
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weather News Scraper */}
                <ScraperCard
                    title="Tin thời tiết & thiên tai"
                    description="Scrape tin tức thời tiết từ NCHMF"
                    status={scraperStatus?.weatherNews}
                    onTrigger={handleTriggerWeatherNews}
                    isTriggering={triggerWeatherNewsMutation.isPending}
                    icon={<CloudRain className="w-6 h-6" />}
                />
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Lưu ý</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Scraper sẽ tự động cập nhật dữ liệu mới và xóa dữ liệu cũ</p>
                    <p>• Thời gian chạy có thể từ vài giây đến vài phút tùy thuộc vào số lượng dữ liệu</p>
                    <p>• Nên chạy scraper vào giờ thấp điểm để tránh ảnh hưởng đến người dùng</p>
                    <p>• Kiểm tra log server để xem chi tiết quá trình scraping</p>
                </CardContent>
            </Card>
        </div>
    );
}
