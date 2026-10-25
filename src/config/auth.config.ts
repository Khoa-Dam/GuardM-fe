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
        if (!token.refreshToken) {
            return { ...token, error: 'RefreshAccessTokenError' };
        }

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
            signal: AbortSignal.timeout(10_000),
        })

        const refreshedTokens = await response.json().catch(() => null)

        if (!response.ok) {
            // Invalid/revoked credentials are terminal; network, rate-limit, and
            // server failures are retried later without ending the user session.
            if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
                return { ...token, error: 'RefreshAccessTokenError' };
            }
            return { ...token, refreshRetryAfter: Date.now() + 15_000 };
        }

        if (!refreshedTokens || typeof refreshedTokens.accessToken !== 'string') {
            return { ...token, refreshRetryAfter: Date.now() + 15_000 };
        }

        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: typeof refreshedTokens.refreshToken === 'string'
                ? refreshedTokens.refreshToken
                : token.refreshToken,
            accessTokenExpires: Date.now() + (3600 - 300) * 1000, // 55 minutes
            refreshRetryAfter: undefined,
            error: undefined,
        }
    } catch {
        return {
            ...token,
            refreshRetryAfter: Date.now() + 15_000,
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

            if (token.error === 'RefreshAccessTokenError') {
                return token;
            }

            if ((token.refreshRetryAfter as number | undefined) && Date.now() < (token.refreshRetryAfter as number)) {
                return token;
            }

            // Access token has expired, try to refresh it
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
            }
            // Propagate error so useUser can sign out gracefully
            if (token.error) {
                return { ...session, error: token.error } as Session
            }
            return session
        },
    },
    events: {
        async signOut(message) {
            if (!('token' in message) || !message.token?.refreshToken) return;

            const apiUrl = env.NEXT_PUBLIC_API_BASE_URL.endsWith('/api')
                ? `${env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`
                : `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`;

            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: message.token.refreshToken }),
                    signal: AbortSignal.timeout(5_000),
                });
            } catch {
                console.error('[Auth] Could not revoke the backend session during sign out');
            }
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
