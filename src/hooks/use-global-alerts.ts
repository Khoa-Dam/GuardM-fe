import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

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

export function useGlobalAlerts() {
    return useQuery<GlobalAlert[]>({
        queryKey: ['global-alerts'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/global-alerts?limit=200`);
            if (!res.ok) throw new Error('Failed to fetch global alerts');
            const data = await res.json();
            console.log('[useGlobalAlerts] fetched:', data.length, 'alerts, with coords:', data.filter((a: GlobalAlert) => a.lat && a.lng).length);
            return data;
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        placeholderData: [],
    });
}
