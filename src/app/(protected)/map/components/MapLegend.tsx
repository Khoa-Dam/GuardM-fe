'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

const severityColors = {
    low: '#56a381',
    medium: '#fcf160',
    high: '#dd3121',
};

const severityLabels = {
    low: 'Low danger',
    medium: 'Medium danger',
    high: 'High danger',
};

export const MapLegend: React.FC = () => {
    return (
        <Card className="map-legend absolute bottom-20 left-4 z-[44] pointer-events-auto rounded">
            {/* Desktop: full legend */}
            <div className="hidden sm:block p-3 space-y-2">
                <h3 className="text-sm font-semibold mb-2">Icon legend</h3>
                <div className="space-y-1.5">
                    {(['high', 'medium', 'low'] as const).map((level) => (
                        <div key={level} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-4 h-4 rounded-full border-2 border-white shrink-0"
                                style={{ backgroundColor: severityColors[level], boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            />
                            <span>{severityLabels[level]}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs pt-1 border-t mt-2">
                        <div className="relative w-4 h-4 shrink-0">
                            <div className="absolute inset-0 rounded-full border-2 border-white"
                                style={{ backgroundColor: severityColors.high, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            <div className="absolute inset-0 rounded-full animate-ping"
                                style={{ backgroundColor: severityColors.high, opacity: 0.4 }} />
                        </div>
                        <span>Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs pt-1 border-t mt-1">
                        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px]"
                            style={{ background: 'rgba(255,154,60,0.15)', border: '1.5px solid #ff9a3c' }}>
                            📰
                        </div>
                        <span>Global news</span>
                    </div>
                </div>
            </div>

            {/* Mobile: dots only */}
            <div className="flex sm:hidden items-center gap-1.5 p-2">
                {(['high', 'medium', 'low'] as const).map((level) => (
                    <div key={level} className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                        style={{ backgroundColor: severityColors[level], boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                ))}
                <div className="relative w-3.5 h-3.5 shrink-0 ml-0.5">
                    <div className="absolute inset-0 rounded-full border border-white"
                        style={{ backgroundColor: severityColors.high }} />
                    <div className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: severityColors.high, opacity: 0.4 }} />
                </div>
                <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ml-0.5 text-[9px]"
                    style={{ background: 'rgba(255,154,60,0.15)', border: '1px solid #ff9a3c' }}>
                    📰
                </div>
            </div>
        </Card>
    );
};

