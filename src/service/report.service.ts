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
    type: CrimeType;
    lat: number;
    lng: number;
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
    type: CrimeType;
    lat: number;
    lng: number;
    address?: string;
    areaCode?: string;
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    source: string;
    attachments?: string[];
    status: number;
    severity: number;
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
     * Get all crime reports
     */
    async findAll(): Promise<CrimeReportResponse[]> {
        try {
            const { data } = await apiClient.get<CrimeReportResponse[]>(
                `${REPORT_BASE}`
            );
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
}

export default new ReportService();
