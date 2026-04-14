'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useReportsQuery, useAdminVerifyReport } from '@/hooks/use-crime-reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';

const verificationLevelLabels: Record<VerificationLevel, string> = {
    [VerificationLevel.UNVERIFIED]: 'Unverified',
    [VerificationLevel.PENDING]: 'Pending',
    [VerificationLevel.CONFIRMED]: 'Confirmed',
    [VerificationLevel.VERIFIED]: 'Verified',
};

const verificationLevelColors: Record<VerificationLevel, string> = {
    [VerificationLevel.UNVERIFIED]: 'bg-gray-500',
    [VerificationLevel.PENDING]: 'bg-yellow-500',
    [VerificationLevel.CONFIRMED]: 'bg-green-500',
    [VerificationLevel.VERIFIED]: 'bg-blue-500',
};

export default function AdminReportsPage() {
    const { data: reports = [], isLoading, error } = useReportsQuery();
    const verifyReportMutation = useAdminVerifyReport();

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<VerificationCrimeReport | null>(null);

    // Filter unverified reports
    const unverifiedReports = reports.filter(
        (r) => r.verificationLevel === VerificationLevel.UNVERIFIED || r.verificationLevel === VerificationLevel.PENDING
    );

    const handleVerify = async () => {
        if (!selectedReport) return;

        try {
            await verifyReportMutation.mutateAsync(selectedReport.id);
            toast.success('Report verified successfully');
            setVerifyDialogOpen(false);
            setSelectedReport(null);
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to verify report');
        }
    };

    const openVerifyDialog = (report: VerificationCrimeReport) => {
        setSelectedReport(report);
        setVerifyDialogOpen(true);
    };

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            <p>An error occurred: {error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Verify Reports</h1>
                <p className="text-muted-foreground">
                    Verify crime reports submitted by users
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {unverifiedReports.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Verified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {reports.filter((r) => r.verificationLevel === VerificationLevel.VERIFIED || r.verificationLevel === VerificationLevel.CONFIRMED).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports Pending Verification</CardTitle>
                    <CardDescription>
                        {unverifiedReports.length} reports need verification
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : unverifiedReports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No reports need verification
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Trust Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unverifiedReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">
                                            {report.title || 'No title'}
                                        </TableCell>
                                        <TableCell>{report.type}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {report.address || 'No address'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={report.trustScore >= 50 ? 'default' : 'secondary'}>
                                                {report.trustScore}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    verificationLevelColors[report.verificationLevel] ||
                                                    'bg-gray-500'
                                                }
                                            >
                                                {verificationLevelLabels[report.verificationLevel] ||
                                                    report.verificationLevel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => openVerifyDialog(report)}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Verify
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Verify Confirmation Dialog */}
            <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to verify report{' '}
                            <strong>{selectedReport?.title}</strong>?
                            <br />
                            <br />
                            The report will be marked as <strong>Verified</strong> with Trust Score = 100.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            disabled={verifyReportMutation.isPending}
                        >
                            {verifyReportMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Verify
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
