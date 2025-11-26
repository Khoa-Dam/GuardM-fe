import { Badge } from '@/components/ui/badge';
import type { VerificationCrimeReport } from '@/types/map';
import { VerificationLevel } from '@/types/verification';

interface ReportStatusBadgeProps {
    report: VerificationCrimeReport;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ report }) => {
    const { verificationLevel, status } = report;
    const level = verificationLevel ?? VerificationLevel.UNVERIFIED;

    if (status === 2) {
        return <Badge className="bg-emerald-100 text-emerald-700">Đã đóng</Badge>;
    }

    if (level === VerificationLevel.CONFIRMED) {
        return <Badge className="bg-blue-100 text-blue-700">Đã xác minh</Badge>;
    }

    if (level === VerificationLevel.VERIFIED) {
        return <Badge className="bg-green-100 text-green-700">Đang theo dõi</Badge>;
    }

    if (level === VerificationLevel.PENDING) {
        return <Badge className="bg-amber-100 text-amber-700">Đang chờ duyệt</Badge>;
    }

    return <Badge variant="secondary">Chưa xác minh</Badge>;
};

