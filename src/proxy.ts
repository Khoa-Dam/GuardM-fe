import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import {
  isPublicRoute,
  isAuthRoute,
  isAdminRoute,
  isOfficerRoute,
  isApiAuthRoute,
  DEFAULT_LOGIN_REDIRECT,
  UNAUTHORIZED_REDIRECT,
} from "@/config/routes"

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // 🚨 BỎ QUA AUTH CHO CÁC ROUTE SEO / STATIC
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next()
  }

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
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes
  if (isAdminRoute(pathname)) {
    if (userRole !== "admin" && userRole !== "Admin") {
      return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  // Officer routes
  if (isOfficerRoute(pathname)) {
    if (!userRole || !["admin", "officer", "Admin", "Officer"].includes(userRole)) {
      return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
