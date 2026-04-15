'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

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
            <PieChart>
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
        </ResponsiveContainer>
    );
};

export default CrimeTypePieChart;
