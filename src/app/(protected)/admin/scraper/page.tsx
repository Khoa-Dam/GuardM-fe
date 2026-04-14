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
            toast.success(result.message || `Scraped ${result.count} wanted criminals`);
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to trigger scraper');
        }
    };

    const handleTriggerWeatherNews = async () => {
        try {
            const result = await triggerWeatherNewsMutation.mutateAsync();
            toast.success(
                result.message ||
                    `Scraped ${result.count} weather articles (${result.imported} new, ${result.updated} updated)`
            );
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to trigger scraper');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Scraper Management</h1>
                    <p className="text-muted-foreground">
                        Trigger and monitor automated scrapers
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Wanted Criminals Scraper */}
                <div className="space-y-4">
                    <ScraperCard
                        title="Wanted Criminals"
                        description="Scrape the wanted criminals list from the Ministry of Public Security"
                        status={scraperStatus?.wantedCriminals}
                        onTrigger={handleTriggerWantedCriminals}
                        isTriggering={triggerWantedCriminalsMutation.isPending}
                        icon={<Database className="w-6 h-6" />}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pages">Pages to scrape (Default: 5)</Label>
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
                                        Each page contains approximately 30 subjects
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="limit">Limit (Optional)</Label>
                                    <Input
                                        id="limit"
                                        type="number"
                                        min={1}
                                        placeholder="Enter limit (e.g. 100)"
                                        value={wantedCriminalsLimit || ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? Number(e.target.value) : undefined;
                                            setWantedCriminalsLimit(val);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        If a limit is set, the page count will be ignored
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weather News Scraper */}
                <ScraperCard
                    title="Weather & Disaster News"
                    description="Scrape weather news from NCHMF"
                    status={scraperStatus?.weatherNews}
                    onTrigger={handleTriggerWeatherNews}
                    isTriggering={triggerWeatherNewsMutation.isPending}
                    icon={<CloudRain className="w-6 h-6" />}
                />
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• The scraper will automatically update new data and remove old data</p>
                    <p>• Runtime can range from a few seconds to several minutes depending on data volume</p>
                    <p>• It is recommended to run the scraper during off-peak hours to minimize impact on users</p>
                    <p>• Check the server logs for detailed scraping progress</p>
                </CardContent>
            </Card>
        </div>
    );
}
