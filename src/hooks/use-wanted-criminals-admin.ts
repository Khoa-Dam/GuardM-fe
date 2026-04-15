import { useMutation, useQueryClient } from '@tanstack/react-query';
import wantedCriminalService, {
    CreateWantedCriminalDto,
    UpdateWantedCriminalDto,
} from '@/service/wanted-criminal.service';
import { wantedKeys } from './use-wanted-criminals';

// Re-export so admin pages can use either import
export { wantedKeys as wantedCriminalsKeys };

/**
 * Mutation hook for creating a wanted criminal (Admin only)
 */
export function useCreateWantedCriminal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateWantedCriminalDto) => wantedCriminalService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: wantedKeys.lists() });
        },
    });
}

/**
 * Mutation hook for updating a wanted criminal (Admin only)
 */
export function useUpdateWantedCriminal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateWantedCriminalDto }) =>
            wantedCriminalService.update(id, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: wantedKeys.lists() });
            queryClient.invalidateQueries({ queryKey: wantedKeys.detail(variables.id) });
        },
    });
}

/**
 * Mutation hook for deleting a wanted criminal (Admin only)
 */
export function useDeleteWantedCriminal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => wantedCriminalService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: wantedKeys.lists() });
        },
    });
}
