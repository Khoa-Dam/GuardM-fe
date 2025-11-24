import type { CrimeReport as BaseCrimeReport } from '@/types/crime';
import { VerificationLevel } from './verification';

export type VerificationCrimeReport = BaseCrimeReport & {
    trustScore: number;
    verificationLevel: VerificationLevel;
    confirmationCount: number;
    disputeCount: number;
};

export type FilterType = 'all' | 'high_severity' | 'cuop_giat' | 'trom_cap';

export { VerificationLevel };

