import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import {
    isPublicRoute,
    isAuthRoute,
    isAdminRoute,
    isOfficerRoute,
    isApiAuthRoute,
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_LOGOUT_REDIRECT,
    UNAUTHORIZED_REDIRECT,
} from "@/config/routes"

export default auth((req) => {
    const { nextUrl } = req
    const pathname = nextUrl.pathname
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role // Lấy role từ session

    // Allow API auth routes (NextAuth endpoints)
    if (isApiAuthRoute(pathname)) {
        return NextResponse.next()
    }

    // Public routes - accessible to everyone
    if (isPublicRoute(pathname)) {
        return NextResponse.next()
    }

    // Auth routes - redirect logged in users away
    if (isAuthRoute(pathname)) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return NextResponse.next()
    }

    // Protected routes - require authentication
    if (!isLoggedIn) {
        // Redirect to login with the original path as a query parameter
        const loginUrl = new URL(DEFAULT_LOGOUT_REDIRECT, nextUrl)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Admin routes - require admin role
    if (isAdminRoute(pathname)) {
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, nextUrl))
        }
        return NextResponse.next()
    }

    // Officer routes - require officer or admin role
    if (isOfficerRoute(pathname)) {
        if (!userRole || !['admin', 'officer'].includes(userRole)) {
            return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, nextUrl))
        }
        return NextResponse.next()
    }

    // Other protected routes - just need to be logged in
    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Luôn chạy middleware cho API routes
        '/(api|trpc)(.*)',
    ],
}

