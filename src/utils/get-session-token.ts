import { getSession } from "next-auth/react"

export async function getSessionToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null

    try {
        const session = await getSession()
        return session?.accessToken || null
    } catch (error) {
        console.error('Error getting session token:', error)
        return null
    }
}

