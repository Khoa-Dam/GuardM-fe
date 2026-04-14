'use client'

import { useUser } from '@/hooks/use-user'

export function SessionGuard() {
    useUser() // triggers auto-signout when session.error is detected
    return null
}
