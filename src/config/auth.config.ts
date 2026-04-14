import type { NextAuthConfig, Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { env } from "../lib/env"
import { isPublicRoute, isAuthRoute, DEFAULT_LOGIN_REDIRECT } from "./routes"
import type { JWT } from "next-auth/jwt"

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property is added
 */
async function refreshAccessToken(token: JWT) {
    try {
        const apiUrl = env.NEXT_PUBLIC_API_BASE_URL.endsWith('/api')
            ? `${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`
            : `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: token.refreshToken,
            }),
        })

        const refreshedTokens = await response.json()

        if (!response.ok) {
            throw refreshedTokens
        }

        console.log('[JWT Callback] Token refresh successful')

        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fall back to old refresh token
            accessTokenExpires: Date.now() + (3600 - 300) * 1000, // 55 minutes
        }
    } catch (error) {
        console.error('[JWT Callback] Token refresh failed:', error)

        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}


export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const pathname = nextUrl.pathname

            // Public routes - always allowed ok
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
                // Google OAuth: exchange Google token with BE to get JWT
                if (account.provider === 'google' && account.id_token) {
                    const apiUrl = env.NEXT_PUBLIC_API_BASE_URL.endsWith('/api')
                        ? `${env.NEXT_PUBLIC_API_BASE_URL}/auth/google`
                        : `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken: account.id_token }),
                    })

                    if (!response.ok) {
                        console.error('[JWT Callback] Google login failed')
                        return { ...token, error: 'GoogleLoginError' }
                    }

                    const data = await response.json()
                    return {
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        userId: data.userId,
                        role: data.role,
                        name: data.name ?? null,
                        avatar: data.avatar ?? null,
                        isGoogleUser: true,
                        accessTokenExpires: Date.now() + (3600 - 300) * 1000,
                    }
                }

                // Credentials login
                return {
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    userId: user.userId,
                    role: user.role,
                    name: user.name ?? null,
                    avatar: user.avatar ?? null,
                    isGoogleUser: false,
                    accessTokenExpires: Date.now() + (3600 - 300) * 1000, // 55 minutes
                }
            }

            // Return previous token if the access token has not expired yet
            const tokenExpires = token.accessTokenExpires as number || 0;
            if (Date.now() < tokenExpires) {
                return token
            }

            // Access token has expired, try to refresh it
            console.log('[JWT Callback] Access token expired, refreshing...')
            return refreshAccessToken(token)
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.userId as string,
                    role: token.role as string | null,
                    name: token.name as string | null,
                    avatar: token.avatar as string | null,
                    isGoogleUser: token.isGoogleUser as boolean,
                }
                // Keep accessToken even on error so public requests still work
                session.accessToken = token.accessToken as string
                session.refreshToken = token.refreshToken as string
            }
            // Propagate error so useUser can sign out gracefully
            if (token.error) {
                console.error('[Session Callback] Token refresh error:', token.error)
                return { ...session, error: token.error } as unknown as Session
            }
            return session
        },
    },
    providers: [
        Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
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
                    const apiUrl = env.NEXT_PUBLIC_API_BASE_URL.endsWith('/api')
                        ? `${env.NEXT_PUBLIC_API_BASE_URL}/auth/login`
                        : `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`

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

                    if (data.accessToken) {
                        return {
                            id: data.user?.id || data.userId || '',
                            email: credentials.email as string,
                            name: data.name || data.user?.name || '',
                            role: data.user?.role || data.role || null,
                            avatar: data.avatar || null,
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

                        // Check if it's a network error (backend not running)
                        const errorMessage = error.message.toLowerCase()
                        const errorCause = error.cause as Record<string, unknown>;

                        if (errorMessage.includes('fetch failed') ||
                            errorMessage.includes('failed to fetch') ||
                            errorMessage.includes('networkerror') ||
                            errorCause?.code === 'ECONNREFUSED' ||
                            errorCause?.code === 'ENOTFOUND') {
                            // Log connection error but return null
                            // The login form will detect this and show appropriate message
                            console.error('[Auth] Connection error detected - server may not be running')
                            return null
                        }
                    }
                    // Return null for other errors - NextAuth will handle it
                    return null
                }
            },
        }),
    ],
} satisfies NextAuthConfig

