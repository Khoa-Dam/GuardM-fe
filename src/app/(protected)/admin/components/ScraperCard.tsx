'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ScraperCardProps {
    title: string;
    description: string;
    status?: {
        lastRun?: string;
        status?: string;
        count?: number;
    };
    onTrigger: () => void;
    isTriggering: boolean;
    icon?: React.ReactNode;
}

export function ScraperCard({
    title,
    description,
    status,
    onTrigger,
    isTriggering,
    icon,
}: ScraperCardProps) {
    const getStatusBadge = () => {
        if (!status?.status) {
            return <Badge variant="outline">Not run yet</Badge>;
        }

        switch (status.status.toLowerCase()) {
            case 'success':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Success
                    </Badge>
                );
            case 'running':
                return (
                    <Badge className="bg-blue-500">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Running
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Error
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status.status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleString('en-US');
        } catch {
            return dateString;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-primary">{icon}</div>}
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Last run
                        </p>
                        <p className="font-medium">{formatDate(status?.lastRun)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Count</p>
                        <p className="font-medium">{status?.count ?? 0} records</p>
                    </div>
                </div>

                <Button
                    onClick={onTrigger}
                    disabled={isTriggering}
                    className="w-full"
                    size="lg"
                >
                    {isTriggering ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Scraper
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
