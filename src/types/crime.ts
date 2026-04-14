import { VerificationLevel } from './verification';

export enum CrimeType {
    TRUY_NA = "truy_na", // Truy nã
    NGHI_PHAM = "nghi_pham", // Nghi phạm
    DANG_NGO = "dang_ngo", // Đáng ngờ
    DE_DOA = "de_doa", // Đe dọa
    GIET_NGUOI = "giet_nguoi", // Giết người
    BAT_COC = "bat_coc", // Bắt cóc
    CUOP_GIAT = "cuop_giat", // Cướp giật
    TROM_CAP = "trom_cap", // Trộm cắp
}



export interface CrimeReport {
    id: string;
    reporterId?: string;
    reporterAvatar?: string;
    reporterName?: string;
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


export const crimeTypeLabels: Record<CrimeType, string> = {
    [CrimeType.TRUY_NA]: "Truy nã",
    [CrimeType.NGHI_PHAM]: "Nghi phạm",
    [CrimeType.DANG_NGO]: "Đáng ngờ",
    [CrimeType.DE_DOA]: "Đe dọa",
    [CrimeType.GIET_NGUOI]: "Giết người",
    [CrimeType.BAT_COC]: "Bắt cóc",
    [CrimeType.CUOP_GIAT]: "Cướp giật",
    [CrimeType.TROM_CAP]: "Trộm cắp",
}
