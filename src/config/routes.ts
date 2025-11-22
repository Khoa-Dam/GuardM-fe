/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * Note: "/" redirects to /dashboard if user is logged in
 */
export const publicRoutes = [
    "/dashboard", // Danh sách truy nã - public, không cần auth
    "/terms",
    "/privacy",
    "/about",
] as const;

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to `DEFAULT_LOGIN_REDIRECT`
 */
export const authRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/forgot-password",
] as const;

/**
 * An array of routes that require admin role
 * Only users with role "admin" can access these routes
 */
export const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/settings",
    "/admin/reports",
] as const;

/**
 * An array of routes that require officer role
 * Users with role "admin" or "officer" can access these routes
 */
export const officerRoutes = [
    "/reports/create",
    "/reports/manage",
] as const;

/**
 * The default redirect path after a user logs in
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * The default redirect path after a user logs out
 */
export const DEFAULT_LOGOUT_REDIRECT = "/login";

/**
 * The redirect path for unauthorized access
 */
export const UNAUTHORIZED_REDIRECT = "/unauthorized";

/**
 * Helper function to check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => pathname.startsWith(route))
}

/**
 * Helper function to check if a path is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
    return authRoutes.some(route => pathname.startsWith(route))
}

/**
 * Helper function to check if a path is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
    return adminRoutes.some(route => pathname.startsWith(route))
}

/**
 * Helper function to check if a path is an officer route
 */
export function isOfficerRoute(pathname: string): boolean {
    return officerRoutes.some(route => pathname.startsWith(route))
}

/**
 * Helper function to check if a path is an API auth route
 */
export function isApiAuthRoute(pathname: string): boolean {
    return pathname.startsWith("/api/auth")
}
