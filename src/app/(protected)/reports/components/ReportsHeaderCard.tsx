'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ReportsHeaderCardProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export const ReportsHeaderCard: React.FC<ReportsHeaderCardProps> = ({ search, onSearchChange }) => {
    return (
        <Card className="border border-border/70">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Report Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Search, track and update crime reports you are interested in.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href="/map">View Map</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/map">Submit New Report</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reports by title, description or address"
                            className="pl-9"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

