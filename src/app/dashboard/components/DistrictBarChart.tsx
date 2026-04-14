'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DistrictData {
    district: string;
    count: number;
}

interface DistrictBarChartProps {
    data: DistrictData[];
}

const DistrictBarChart = ({ data }: DistrictBarChartProps) => {
    if (!data.length) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <BarChart data={data}>
                <XAxis
                    dataKey="district"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} báo cáo`}
                    wrapperClassName="text-sm"
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DistrictBarChart;
