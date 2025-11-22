import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

/**
 * Gets the current user from the server session
 *
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
    const session = await auth()
    return session?.user ?? null
}

/**
 * Checks if the current user is authenticated
 * If not, redirects to the login page
 */
export const checkAuth = async () => {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }
    return session
}

/**
 * Requires the user to have one of the specified roles
 * If not authenticated or role doesn't match, redirects to unauthorized page
 * 
 * @param allowedRoles - Array of roles that are allowed to access
 * @returns The session if user has required role
 */
export const requireRole = async (allowedRoles: string[]) => {
    const session = await checkAuth()
    const userRole = session?.user?.role

    if (!userRole || !allowedRoles.includes(userRole)) {
        redirect("/unauthorized")
    }

    return session
}

