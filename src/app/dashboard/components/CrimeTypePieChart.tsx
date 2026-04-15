'use client';

import { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CrimeTypeData {
    label: string;
    count: number;
    [key: string]: string | number;
}

interface CrimeTypePieChartProps {
    data: CrimeTypeData[];
    colors: string[];
}

const CrimeTypePieChart = ({ data, colors }: CrimeTypePieChartProps) => {
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
                <PieChart width={width} height={256}>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={1}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${entry.label}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `${Number(value).toLocaleString('en-US')} reports`}
                        wrapperClassName="text-sm"
                    />
                </PieChart>
            )}
        </div>
    );
};

export default CrimeTypePieChart;
