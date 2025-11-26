'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { SummaryCardConfig } from '../types/types';

interface SummaryCardsProps {
    cards: SummaryCardConfig[];
    statsLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards, statsLoading }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {statsLoading && card.showSpinner ? (
                                <Spinner className="h-5 w-5" />
                            ) : (
                                card.value.toLocaleString('vi-VN')
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

