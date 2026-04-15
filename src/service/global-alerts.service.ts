import apiClient from '@/utils/apiClient.util';
import { handleApiError } from '@/utils/error.util';

export interface GlobalAlert {
    id: string;
    source: string;
    title: string;
    url: string;
    lat: number;
    lng: number;
    locationName: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    summary: string | null;
    publishedAt: string;
    createdAt: string;
}

class GlobalAlertsService {
    async findAll(limit = 200): Promise<GlobalAlert[]> {
        try {
            const { data } = await apiClient.get<GlobalAlert[]>('/global-alerts', {
                params: { limit },
            });
            return data;
        } catch (error) {
            handleApiError(error, 'Failed to fetch global alerts');
        }
    }
}

const globalAlertsService = new GlobalAlertsService();
export default globalAlertsService;
