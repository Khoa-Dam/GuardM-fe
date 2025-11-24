import { VerificationLevel } from './verification';

export interface CrimeReport {
    id: string;
    reporterId?: string;
    title?: string;
    description?: string;
    type?: string;
    lat?: number;
    lng?: number;
    address?: string;
    areaCode?: string;
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    source?: string;
    attachments?: string[];
    status: number;
    severity: number;
    severityLevel: 'low' | 'medium' | 'high';
    trustScore?: number;
    verificationLevel?: VerificationLevel;
    confirmationCount?: number;
    disputeCount?: number;
    verifiedBy?: string;
    verifiedAt?: string | Date;
    reportedAt?: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
}

