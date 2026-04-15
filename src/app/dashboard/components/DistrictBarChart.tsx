'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DistrictData {
    district: string;
    count: number;
}

interface DistrictBarChartProps {
    data: DistrictData[];
}

const DistrictBarChart = ({ data }: DistrictBarChartProps) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!data.length) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available
            </div>
        );
    }

    if (!mounted) return null;

    return (
        <ResponsiveContainer width="100%" height={256} minWidth={0} debounce={50}>
            <BarChart data={data}>
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
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DistrictBarChart;
