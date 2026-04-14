'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { VerificationCrimeReport } from '@/types/map';
import { ReportStatusBadge } from './ReportStatusBadge';
import { formatDate } from '../utils/utils';
import { severityLabels, statusLabels, verificationText } from '../utils/constants';

interface MyReportsSectionProps {
    reports: VerificationCrimeReport[];
    loading: boolean;
}

export const MyReportsSection: React.FC<MyReportsSectionProps> = ({ reports, loading }) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">My Reports</CardTitle>
                <CardDescription>Track reports you have submitted</CardDescription>
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
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{report.title || 'Untitled Report'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Updated {formatDate(report.updatedAt)}
                                        </p>
                                    </div>
                                    <ReportStatusBadge report={report} />
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span>Trust score: {report.trustScore ?? 0}</span>
                                    <span>
                                        Vote: {report.confirmationCount ?? 0} confirmed / {report.disputeCount ?? 0} disputed
                                    </span>
                                    <span>Severity: {severityLabels[report.severityLevel] ?? 'Unknown'}</span>
                                </div>
                                {report.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                                )}
                                <div className="grid gap-2 rounded-lg border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
                                    <div className="flex justify-between gap-2">
                                        <span>Status</span>
                                        <span className="font-medium text-foreground">
                                            {statusLabels[report.status] ?? 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span>Verification</span>
                                        <span className="font-medium text-foreground">
                                            {verificationText[report.verificationLevel]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span>Location</span>
                                        <span className="font-medium text-foreground">
                                            {report.address ||
                                                [report.district, report.province].filter(Boolean).join(', ') ||
                                                'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link href={`/map?focus=${report.id}`}>View on Map</Link>
                                    </Button>
                                    <Button asChild size="sm" className="flex-1">
                                        <Link href={`/map?edit=${report.id}`}>Edit</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        You have no reports yet.{' '}
                        <Link href="/map" className="text-primary underline">
                            Submit a report now
                        </Link>
                        .
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

