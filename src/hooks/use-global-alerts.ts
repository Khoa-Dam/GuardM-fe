import { useQuery } from '@tanstack/react-query';
import globalAlertsService, { type GlobalAlert } from '@/service/global-alerts.service';

export type { GlobalAlert };

export const globalAlertsKeys = {
    all: ['global-alerts'] as const,
    list: (limit?: number) => [...globalAlertsKeys.all, 'list', limit] as const,
};

export function useGlobalAlerts() {
    return useQuery<GlobalAlert[]>({
        queryKey: globalAlertsKeys.list(200),
        queryFn: () => globalAlertsService.findAll(200),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        placeholderData: [],
    });
}
