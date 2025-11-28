import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, CreateUserDto, UpdateUserDto } from '@/service/user.service';

// Query keys for cache management
export const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

/**
 * React Query hook for fetching all users (Admin only)
 */
export function useUsersQuery() {
    return useQuery({
        queryKey: usersKeys.lists(),
        queryFn: () => userService.findAll(),
    });
}

/**
 * React Query hook for fetching a single user by ID (Admin only)
 */
export function useUserQuery(id: string) {
    return useQuery({
        queryKey: usersKeys.detail(id),
        queryFn: () => userService.findOne(id),
        enabled: !!id,
    });
}

/**
 * Mutation hook for creating a user (Admin only)
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserDto) => userService.create(payload),
        onSuccess: () => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}

/**
 * Mutation hook for updating a user (Admin only)
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDto }) =>
            userService.update(id, payload),
        onSuccess: (data, variables) => {
            // Invalidate users list
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
            // Invalidate specific user detail
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
        },
    });
}

/**
 * Mutation hook for deleting a user (Admin only)
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.remove(id),
        onSuccess: () => {
            // Invalidate users list
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}
