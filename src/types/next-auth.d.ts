import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email?: string | null
            name?: string | null
            role?: string | null
            avatar?: string | null
            isGoogleUser?: boolean
        }
        accessToken?: string
        error?: string
    }

    interface User {
        id: string
        email?: string | null
        name?: string | null
        role?: string | null
        avatar?: string | null
        isGoogleUser?: boolean
        accessToken?: string
        refreshToken?: string
        userId?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        userId?: string
        role?: string | null
        name?: string | null
        avatar?: string | null
        isGoogleUser?: boolean
        accessTokenExpires?: number
        refreshRetryAfter?: number
        error?: string
    }
}
