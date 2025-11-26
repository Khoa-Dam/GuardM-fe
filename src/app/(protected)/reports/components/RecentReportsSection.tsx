'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { VerificationCrimeReport } from '@/types/map';
import { crimeTypeLabels } from '@/types/crime';
import { CrimeType } from '@/service/report.service';
import { ReportStatusBadge } from './ReportStatusBadge';
import { formatDate } from '../utils/utils';
import { severityLabels, statusLabels, verificationText } from '../utils/constants';

interface RecentReportsSectionProps {
    reports: VerificationCrimeReport[];
    loading: boolean;
}

export const RecentReportsSection: React.FC<RecentReportsSectionProps> = ({ reports, loading }) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Báo cáo gần đây</CardTitle>
                <CardDescription>Danh sách được cập nhật từ dữ liệu thực</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Spinner className="h-5 w-5" />
                    </div>
                ) : reports.length ? (
                    reports.map((report) => (
                        <Card key={report.id} className="p-4 border-muted">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold leading-tight">
                                            {report.title || 'Báo cáo không tiêu đề'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Gửi ngày {formatDate(report.createdAt)} • {report.address || 'Chưa có địa chỉ'}
                                        </p>
                                    </div>
                                    <ReportStatusBadge report={report} />
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span>
                                        Loại:{' '}
                                        {report.type
                                            ? crimeTypeLabels[report.type as CrimeType] ?? report.type
                                            : 'Chưa rõ'}
                                    </span>
                                    <span>Trust score: {report.trustScore ?? 0}</span>
                                    <span>Mức độ: {severityLabels[report.severityLevel] ?? 'Không rõ'}</span>
                                </div>
                                {report.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                                )}
                                <div className="grid gap-2 rounded-lg border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
                                    <div className="flex justify-between gap-2">
                                        <span>Trạng thái</span>
                                        <span className="font-medium text-foreground">
                                            {statusLabels[report.status] ?? 'Không rõ'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span>Độ xác thực</span>
                                        <span className="font-medium text-foreground">
                                            {verificationText[report.verificationLevel]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span>Vote cộng đồng</span>
                                        <span className="font-medium text-foreground">
                                            {report.confirmationCount ?? 0} xác nhận / {report.disputeCount ?? 0} phủ nhận
                                        </span>
                                    </div>
                                </div>
                                <Separator className="my-1" />
                                <Button asChild variant="outline" size="sm" className="justify-start">
                                    <Link href={`/map?focus=${report.id}`}>Xem trên bản đồ</Link>
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Chưa có báo cáo nào.</p>
                )}
            </CardContent>
        </Card>
    );
};

