import { useQuery } from '@tanstack/react-query';
import wantedCriminalService, { WantedCriminalResponse, PaginatedResponse } from '@/service/wanted-criminal.service';

export const wantedKeys = {
    all: ['wanted'] as const,
    lists: () => [...wantedKeys.all, 'list'] as const,
    list: (page: number, limit: number, search?: string) => [...wantedKeys.lists(), { page, limit, search }] as const,
    detail: (id: string) => [...wantedKeys.all, 'detail', id] as const,
};

interface UseWantedCriminalsOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export function useWantedCriminals({ page = 1, limit = 9, search }: UseWantedCriminalsOptions = {}) {
    return useQuery<PaginatedResponse<WantedCriminalResponse>>({
        queryKey: wantedKeys.list(page, limit, search),
        queryFn: () => wantedCriminalService.findAll(page, limit, search),
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
}

