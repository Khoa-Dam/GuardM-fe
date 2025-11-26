import apiClient from '@/utils/apiClient.util';

const REPORT_BASE = '/crime-reports';

// Crime Type Enum (matching backend)
export enum CrimeType {
    GietNguoi = 'giet_nguoi',
    BatCoc = 'bat_coc',
    TruyNa = 'truy_na',
    CuopGiat = 'cuop_giat',
    DeDoa = 'de_doa',
    NghiPham = 'nghi_pham',
    DangNgo = 'dang_ngo',
    TromCap = 'trom_cap',
}

// Request DTOs
export interface CreateCrimeReportDto {
    title?: string;
    description?: string;
    type?: CrimeType;
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
    severity?: number;
    reportedAt?: Date;
}

export interface UpdateCrimeReportDto {
    title?: string;
    description?: string;
    type?: CrimeType;
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
    severity?: number;
    reportedAt?: Date;
}

// Response DTOs
export interface CrimeReportResponse {
    id: string;
    reporterId?: string;
    reporter?: {
        id: string;
        name: string;
        email: string;
    };
    title?: string;
    description?: string;
    type?: CrimeType;
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
    severityLevel?: 'low' | 'medium' | 'high';
    trustScore?: number;
    verificationLevel?: string;
    confirmationCount?: number;
    disputeCount?: number;
    verifiedBy?: string;
    verifiedAt?: Date;
    reportedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CrimeHeatmapData {
    latitude: number;
    longitude: number;
    district: string;
    province: string;
    crimeType: CrimeType;
    count: number;
    severity: 'low' | 'medium' | 'high';
}

export interface CrimeStatistics {
    total: number;
    activeAlerts: number;
    highSeverity: number;
    byType: Array<{
        type: CrimeType;
        count: number;
    }>;
    byDistrict: Array<{
        district: string;
        count: number;
    }>;
}

export interface NearbyAlertResponse {
    hasAlert: boolean;
    message?: string;
    alertLevel?: 'low' | 'medium' | 'high';
    totalReports?: number;
    totalDangerScore?: number;
    reports?: Array<{
        id: string;
        title?: string;
        type: CrimeType;
        lat: number;
        lng: number;
        address?: string;
        createdAt: Date;
    }>;
}

export interface VoteStatus {
    hasConfirmed: boolean;
    hasDisputed: boolean;
    voteCount: number; // Tổng số vote (0, 1, hoặc 2)
    canVote: boolean; // Có thể vote thêm không (voteCount < 2)
    isOwner: boolean; // Có phải owner của report không
}

class ReportService {
    /**
     * Create a new crime report
     * Requires authentication
     */
    async create(payload: CreateCrimeReportDto): Promise<CrimeReportResponse> {
        try {
            const { data } = await apiClient.post<CrimeReportResponse>(
                `${REPORT_BASE}`,
                payload
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                (errorData && typeof errorData === 'string' ? errorData : null) ||
                error?.message ||
                'Không thể tạo báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get all crime reports (optionally filter by type)
     */
    async findAll(type?: CrimeType): Promise<CrimeReportResponse[]> {
        try {
            const query = type ? `?type=${encodeURIComponent(type)}` : '';
            const { data } = await apiClient.get<CrimeReportResponse[]>(`${REPORT_BASE}${query}`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải danh sách báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Confirm a report (community verification)
     */
    async confirmReport(id: string): Promise<CrimeReportResponse> {
        try {
            const { data } = await apiClient.post<CrimeReportResponse>(`${REPORT_BASE}/${id}/confirm`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể xác nhận báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Dispute a report (community verification)
     */
    async disputeReport(id: string): Promise<CrimeReportResponse> {
        try {
            const { data } = await apiClient.post<CrimeReportResponse>(`${REPORT_BASE}/${id}/dispute`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể báo cáo sai lệch. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Verify a report (admin only)
     */
    async verifyReport(id: string): Promise<CrimeReportResponse> {
        try {
            const { data } = await apiClient.put<CrimeReportResponse>(`${REPORT_BASE}/${id}/verify`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể xác minh báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get a single crime report by ID
     */
    async findOne(id: string): Promise<CrimeReportResponse> {
        try {
            const { data } = await apiClient.get<CrimeReportResponse>(
                `${REPORT_BASE}/${id}`
            );
            return data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                throw new Error('Không tìm thấy báo cáo');
            }
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get crime reports by district
     */
    async findByDistrict(district: string): Promise<CrimeReportResponse[]> {
        try {
            const { data } = await apiClient.get<CrimeReportResponse[]>(
                `${REPORT_BASE}/district/${encodeURIComponent(district)}`
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải báo cáo theo quận. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get crime reports by city/province
     */
    async findByCity(province: string): Promise<CrimeReportResponse[]> {
        try {
            const { data } = await apiClient.get<CrimeReportResponse[]>(
                `${REPORT_BASE}/city/${encodeURIComponent(province)}`
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải báo cáo theo tỉnh/thành phố. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get heatmap data for crime reports
     */
    async getHeatmap(): Promise<CrimeHeatmapData[]> {
        try {
            const { data } = await apiClient.get<CrimeHeatmapData[]>(
                `${REPORT_BASE}/heatmap`
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải dữ liệu heatmap. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get crime statistics
     */
    async getStatistics(): Promise<CrimeStatistics> {
        try {
            const { data } = await apiClient.get<CrimeStatistics>(
                `${REPORT_BASE}/statistics`
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải thống kê. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get nearby crime alerts
     * @param lat - Latitude
     * @param lng - Longitude
     * @param radius - Radius in kilometers (default: 5)
     */
    async getNearbyAlerts(
        lat: number,
        lng: number,
        radius?: number
    ): Promise<NearbyAlertResponse> {
        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
            });
            if (radius) {
                params.append('radius', radius.toString());
            }

            const { data } = await apiClient.get<NearbyAlertResponse>(
                `${REPORT_BASE}/nearby?${params.toString()}`
            );
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải cảnh báo gần đây. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get crime reports created by current user
     * Requires authentication
     */
    async findMine(): Promise<CrimeReportResponse[]> {
        try {
            const { data } = await apiClient.get<CrimeReportResponse[]>(`${REPORT_BASE}/me`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải danh sách báo cáo của bạn. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Update an existing crime report (owner only)
     * Supports both JSON payload and FormData (for file uploads)
     * @param id - Report ID
     * @param payload - Update data (UpdateCrimeReportDto or FormData)
     */
    async update(id: string, payload: UpdateCrimeReportDto | FormData): Promise<CrimeReportResponse> {
        try {
            const isFormData = payload instanceof FormData;
            const { data } = await apiClient.put<CrimeReportResponse>(
                `${REPORT_BASE}/${id}`,
                payload,
                isFormData ? {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                } : undefined
            );
            return data;
        } catch (error: any) {
            if (error?.response?.status === 400) {
                throw new Error('Bạn không có quyền chỉnh sửa báo cáo này');
            }
            if (error?.response?.status === 404) {
                throw new Error('Không tìm thấy báo cáo');
            }
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể cập nhật báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Delete a crime report (owner only)
     * @param id - Report ID
     */
    async delete(id: string): Promise<{ message: string }> {
        try {
            const { data } = await apiClient.delete<{ message: string }>(`${REPORT_BASE}/${id}`);
            return data;
        } catch (error: any) {
            if (error?.response?.status === 400) {
                throw new Error('Bạn không có quyền xóa báo cáo này');
            }
            if (error?.response?.status === 404) {
                throw new Error('Không tìm thấy báo cáo');
            }
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể xóa báo cáo. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get vote status for current user on a report
     * @param id - Report ID
     */
    async getVoteStatus(id: string): Promise<VoteStatus> {
        try {
            const { data } = await apiClient.get<VoteStatus>(`${REPORT_BASE}/${id}/vote-status`);
            return data;
        } catch (error: any) {
            // If endpoint doesn't exist, return default (can vote)
            if (error?.response?.status === 404) {
                return {
                    hasConfirmed: false,
                    hasDisputed: false,
                    voteCount: 0,
                    canVote: true,
                    isOwner: false,
                };
            }
            const errorData = error?.response?.data;
            const errorMessage =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                'Không thể tải trạng thái vote. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Create FormData from UpdateCrimeReportDto and files
     * Utility method for multipart uploads
     */
    createUpdateFormData(
        dto: UpdateCrimeReportDto,
        files?: File[]
    ): FormData {
        const formData = new FormData();

        // Add DTO fields
        if (dto.title) formData.append('title', dto.title);
        if (dto.description) formData.append('description', dto.description);
        if (dto.type) formData.append('type', dto.type);
        if (dto.lat !== undefined) formData.append('lat', dto.lat.toString());
        if (dto.lng !== undefined) formData.append('lng', dto.lng.toString());
        if (dto.address) formData.append('address', dto.address);
        if (dto.areaCode) formData.append('areaCode', dto.areaCode);
        if (dto.province) formData.append('province', dto.province);
        if (dto.district) formData.append('district', dto.district);
        if (dto.ward) formData.append('ward', dto.ward);
        if (dto.street) formData.append('street', dto.street);
        if (dto.source) formData.append('source', dto.source);
        if (dto.severity !== undefined) formData.append('severity', dto.severity.toString());
        if (dto.reportedAt) formData.append('reportedAt', dto.reportedAt.toISOString());

        // Add existing attachment URLs (to keep)
        if (dto.attachments) {
            dto.attachments.forEach((attachment) => {
                formData.append('attachments', attachment);
            });
        }

        // Add new files
        if (files) {
            files.forEach((file) => {
                formData.append('files', file);
            });
        }

        return formData;
    }
}

export default new ReportService();
