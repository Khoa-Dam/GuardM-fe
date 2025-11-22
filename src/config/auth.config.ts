import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { env } from "../lib/env"
import { isPublicRoute, isAuthRoute, DEFAULT_LOGIN_REDIRECT } from "./routes"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const pathname = nextUrl.pathname

            // Public routes - always allowed
            if (isPublicRoute(pathname)) {
                return true
            }

            // Auth routes - redirect logged in users away
            if (isAuthRoute(pathname)) {
                if (isLoggedIn) {
                    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
                }
                return true
            }

            // Protected routes - require authentication
            if (isLoggedIn) {
                return true
            }

            return false // Redirect unauthenticated users to login page
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.userId = user.userId
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.userId as string,
                    role: token.role as string | null,
                }
                session.accessToken = token.accessToken as string
                session.refreshToken = token.refreshToken as string
            }
            return session
        },
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.error('[Auth] Missing credentials')
                    return null
                }

                try {
                    const apiUrl = env.API_BASE_URL.endsWith('/api')
                        ? `${env.API_BASE_URL}/auth/login`
                        : `${env.API_BASE_URL}/api/auth/login`

                    console.log('[Auth] Calling API:', apiUrl)
                    console.log('[Auth] Email:', credentials.email)

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    })

                    console.log('[Auth] Response status:', response.status, response.statusText)

                    if (!response.ok) {
                        const errorText = await response.text()
                        console.error('[Auth] API Error:', {
                            status: response.status,
                            statusText: response.statusText,
                            body: errorText
                        })
                        return null
                    }

                    const data = await response.json()
                    console.log('[Auth] Response data:', {
                        hasAccessToken: !!data.accessToken,
                        hasUser: !!data.user,
                        userId: data.user?.id || data.userId
                    })

                    if (data.accessToken) {
                        return {
                            id: data.user?.id || data.userId || '',
                            email: credentials.email as string,
                            name: data.user?.name || '',
                            role: data.user?.role || data.role || null, // Lấy role từ BE
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            userId: data.user?.id || data.userId || '',
                        }
                    }

                    console.error('[Auth] No accessToken in response')
                    return null
                } catch (error) {
                    console.error('[Auth] Fetch error:', error)
                    if (error instanceof Error) {
                        console.error('[Auth] Error message:', error.message)
                        console.error('[Auth] Error cause:', error.cause)
                    }
                    return null
                }
            },
        }),
    ],
} satisfies NextAuthConfig

