import { useCallback, useEffect, useState } from 'react';
import reportService, { CrimeReportResponse, CrimeType } from '@/service/report.service';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';

type ActionType = 'confirm' | 'dispute' | 'verify';

interface UseCrimeReportsOptions {
    fallbackData?: VerificationCrimeReport[];
}

interface ActionState {
    id: string | null;
    type: ActionType | null;
}

const normalizeReport = (report: CrimeReportResponse): VerificationCrimeReport => ({
    ...report,
    severityLevel: report.severityLevel ?? 'low',
    trustScore: report.trustScore ?? 0,
    verificationLevel: (report.verificationLevel as VerificationLevel) ?? VerificationLevel.UNVERIFIED,
    confirmationCount: report.confirmationCount ?? 0,
    disputeCount: report.disputeCount ?? 0,
});

export function useCrimeReports(type?: CrimeType, options: UseCrimeReportsOptions = {}) {
    const [reports, setReports] = useState<VerificationCrimeReport[]>(options.fallbackData ?? []);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionState, setActionState] = useState<ActionState>({ id: null, type: null });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.findAll(type);
            setReports(data.map(normalizeReport));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo';
            setError(message);
            if (options.fallbackData) {
                setReports(options.fallbackData);
            }
        } finally {
            setLoading(false);
        }
    }, [type, options.fallbackData]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const runAction = useCallback(
        async (id: string, action: ActionType) => {
            setActionState({ id, type: action });
            try {
                let updated: CrimeReportResponse;
                if (action === 'confirm') {
                    updated = await reportService.confirmReport(id);
                } else if (action === 'dispute') {
                    updated = await reportService.disputeReport(id);
                } else {
                    updated = await reportService.verifyReport(id);
                }

                const normalized = normalizeReport(updated);
                setReports((prev) => prev.map((report) => (report.id === id ? normalized : report)));
                return normalized;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
                throw new Error(message);
            } finally {
                setActionState({ id: null, type: null });
            }
        },
        []
    );

    const confirmReport = useCallback((id: string) => runAction(id, 'confirm'), [runAction]);
    const disputeReport = useCallback((id: string) => runAction(id, 'dispute'), [runAction]);
    const verifyReport = useCallback((id: string) => runAction(id, 'verify'), [runAction]);

    return {
        reports,
        loading,
        error,
        refresh: fetchReports,
        actionState,
        confirmReport,
        disputeReport,
        verifyReport,
    };
}

