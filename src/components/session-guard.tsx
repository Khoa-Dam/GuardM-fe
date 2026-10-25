'use client'

import { useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SessionGuard() {
    const { data: session } = useSession()
    const router = useRouter()
    const handledError = useRef(false)
    const sessionError = session?.error

    useEffect(() => {
        if (sessionError !== 'RefreshAccessTokenError') {
            handledError.current = false
            return
        }
        if (handledError.current) return

        handledError.current = true
        toast.error('Phiên đăng nhập đã hết hạn', {
            description: 'Không thể làm mới phiên này. Bạn sẽ được chuyển đến trang đăng nhập.',
            duration: 3_500,
        })

        const currentPath = `${window.location.pathname}${window.location.search}`
        const loginPath = currentPath.startsWith('/login')
            ? '/login'
            : `/login?redirect=${encodeURIComponent(currentPath || '/')}`

        const timeout = window.setTimeout(async () => {
            try {
                await signOut({ redirect: false })
            } catch {
                // Continue to login even if the sign-out request itself fails.
            }
            router.replace(loginPath)
        }, 2_000)

        return () => window.clearTimeout(timeout)
    }, [router, sessionError])

    return null
}
