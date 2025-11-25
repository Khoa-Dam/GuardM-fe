"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

const SidebarContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(true)
    return (
        <SidebarContext.Provider value={{ open, setOpen }}>
            <div className=" h-screen w-full">{children}</div>
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) throw new Error("useSidebar must be used within SidebarProvider")
    return context
}

export function Sidebar({ children }: { children: React.ReactNode }) {
    const { open } = useSidebar()
    return (
        <aside
            className={cn(
                "transition-all duration-300 bg-gray-100 border-r",
                open ? "w-64" : "w-16"
            )}
        >
            {children}
        </aside>
    )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
    return <div className="p-4">{children}</div>
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
    return <div className="mb-4">{children}</div>
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
    return <h2 className="text-center text-2xl font-bold text-red-500">{children}</h2>
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
    return <div className="mt-3">{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
    return <ul className="space-y-2">{children}</ul>
}



export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
    return <li className="">{children}</li>
}

export function SidebarMenuButton({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    return (
        <button
            className={cn(
                "flex items-center gap-3 w-full  text-left rounded-md hover:bg-gray-200"
            )}
        >
            {children}
        </button>
    )
}

export function SidebarTrigger() {
    const { open, setOpen } = useSidebar()
    return (
        <button
            onClick={() => setOpen(!open)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
            Toggle
        </button>
    )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
    return <div className="ml-4">{children}</div>
}
