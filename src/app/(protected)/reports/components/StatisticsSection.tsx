'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { CrimeStatistics } from '@/service/report.service';
import { typeColors } from '../utils/constants';
import type { CrimeTypeDatum } from '../types/types';

interface StatisticsSectionProps {
    stats: CrimeStatistics | null;
    statsLoading: boolean;
    byTypeData: CrimeTypeDatum[];
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
    stats,
    statsLoading,
    byTypeData,
}) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Thống kê báo cáo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Theo loại tội phạm</p>
                    <div className="h-64">
                        {statsLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Spinner className="h-5 w-5" />
                            </div>
                        ) : byTypeData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byTypeData}
                                        dataKey="count"
                                        nameKey="label"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={1}
                                    >
                                        {byTypeData.map((entry, index) => (
                                            <Cell
                                                key={entry.type}
                                                fill={typeColors[index % typeColors.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${Number(value).toLocaleString('vi-VN')} báo cáo`}
                                        wrapperClassName="text-sm"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Chưa có dữ liệu
                            </div>
                        )}
                    </div>
                    {byTypeData.length ? (
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {byTypeData.map((item, index) => (
                                <span key={item.type} className="flex items-center gap-1">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: typeColors[index % typeColors.length] }}
                                    />
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Top quận/huyện</p>
                    <div className="h-64">
                        {statsLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Spinner className="h-5 w-5" />
                            </div>
                        ) : stats?.byDistrict?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.byDistrict.slice(0, 8)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="district" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip
                                        formatter={(value) => `${Number(value).toLocaleString('vi-VN')} báo cáo`}
                                        wrapperClassName="text-sm"
                                    />
                                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Chưa có dữ liệu
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

