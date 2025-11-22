import { useSession } from "next-auth/react"

/**
 * Custom hook to get current user information from session
 * 
 * @returns User information with formatted name and role
 */
export function useUser() {
    const { data: session, status } = useSession()

    const user = session?.user
    const isAuthenticated = !!session
    const isLoading = status === "loading"

    // Format user name - fallback to email or default
    const userName = user?.name || user?.email || "Người dùng"

    // Format user role - fallback to default role text
    const userRole = user?.role || "Cục cảnh sát truy nã"

    // User ID
    const userId = user?.id || null

    // User email
    const userEmail = user?.email || null

    return {
        user,
        userName,
        userRole,
        userId,
        userEmail,
        isAuthenticated,
        isLoading,
        session,
    }
}


