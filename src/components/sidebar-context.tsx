"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const MD = 768

export function SidebarStateProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Auto-open on large screens at startup
        setIsOpen(window.innerWidth >= MD)

        // Only auto-close when shrinking to mobile — don't force open on desktop
        const onResize = () => {
            if (window.innerWidth < MD) setIsOpen(false)
        }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    const toggle = () => setIsOpen((prev) => !prev)

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebarState() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebarState must be used within SidebarStateProvider")
    }
    return context
}

