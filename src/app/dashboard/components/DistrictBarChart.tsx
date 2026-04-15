'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DistrictData {
    district: string;
    count: number;
}

interface DistrictBarChartProps {
    data: DistrictData[];
}

const DistrictBarChart = ({ data }: DistrictBarChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width ?? 0;
            if (w > 0) setWidth(w);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    if (!data.length) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ width: '100%', height: 256 }}>
            {width > 0 && (
                <BarChart width={width} height={256} data={data}>
                    <XAxis
                        dataKey="district"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip
                        formatter={(value) => `${Number(value).toLocaleString('en-US')} reports`}
                        wrapperClassName="text-sm"
                    />
                    <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
            )}
        </div>
    );
};

export default DistrictBarChart;
