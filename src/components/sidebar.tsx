"use client"

import { useEffect, useRef } from "react"
import { MapPin, Home, MessageSquareWarning, ShieldX, CloudRain, Phone, FileText, AlertTriangle, ShieldCheck, Users, Globe, Settings, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStatistics } from "@/hooks/use-statistics"
import { useHomeData } from "@/hooks/use-home-data"
import { useUser } from "@/hooks/use-user"
import { gsap } from "gsap"

interface SidebarProps {
    isOpen: boolean
    selectedCategory?: string
    onCategoryChange?: (category: string) => void
    onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { userRole } = useUser()
    const sidebarRef = useRef<HTMLElement>(null)
    const itemsRef = useRef<(HTMLAnchorElement | null)[]>([])

    const { data: stats, isLoading: statsLoading } = useStatistics()
    const { data: homeData, isLoading: homeLoading } = useHomeData()

    const navItems = [
        { label: "Live Feed", href: "/dashboard", icon: Home, color: "#00d4ff" },
        { label: "Wanted List", href: "/wanted", icon: ShieldX, color: "#ff3b3b" },
        { label: "Weather & Disasters", href: "/weather", icon: CloudRain, color: "#00d4ff" },
        { label: "Crime Map", href: "/map", icon: MapPin, color: "#ffd700" },
        { label: "Incident Reports", href: "/reports", icon: MessageSquareWarning, color: "#ff3b3b" },
        { label: "Home", href: "/", icon: Globe, color: "#00ff88" },
    ]

    if (userRole === 'admin' || userRole === 'Admin') {
        navItems.push({ label: "System Admin", href: "/admin", icon: Settings, color: "#a855f7" })
    }

    const miniStats = [
        { label: "Total Reports", value: stats?.total, icon: FileText, color: "#00d4ff" },
        { label: "Active", value: stats?.activeAlerts, icon: AlertTriangle, color: "#ffd700" },
        { label: "High Risk", value: stats?.highSeverity, icon: ShieldCheck, color: "#ff3b3b" },
        { label: "Wanted", value: homeData?.statistics?.totalWanted, icon: Users, color: "#00ff88" },
    ]

    const isLoading = statsLoading || homeLoading

    // GSAP: stagger nav items when sidebar opens
    useEffect(() => {
        const items = itemsRef.current.filter(Boolean)
        if (isOpen && items.length) {
            gsap.fromTo(items,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: "power3.out", delay: 0.1 }
            )
        }
    }, [isOpen])

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                ref={sidebarRef}
                className={cn(
                    "flex flex-col shrink-0 w-64 h-screen overflow-y-auto",
                    "fixed md:sticky inset-y-0 left-0 md:top-0 md:left-auto z-50",
                    "transition-transform duration-300 ease-in-out",
                    "border-r border-[rgba(0,212,255,0.12)]",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                )}
                style={{ background: "rgba(6,10,20,0.97)", backdropFilter: "blur(20px)" }}
            >
                {/* Scanlines overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.5) 2px, rgba(0,212,255,0.5) 3px)", backgroundSize: "100% 3px" }} />

                {/* Top accent line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50" />

                <div className="relative flex flex-col gap-5 p-4 flex-1">
                    {/* Brand */}
                    <div className="px-2 py-3 border-b border-[rgba(0,212,255,0.1)]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-pulse" />
                            <span className="font-mono text-[9px] tracking-[0.3em] text-[#00d4ff]/50 uppercase">GuardM v2.0</span>
                        </div>
                        <p className="font-mono text-[10px] text-[#00d4ff]/30 mt-0.5 tracking-widest">SURVEILLANCE SYSTEM</p>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-1">
                        <p className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/30 uppercase px-2 mb-2">NAVIGATION</p>
                        {navItems.map((item, i) => {
                            const Icon = item.icon
                            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    ref={(el) => { itemsRef.current[i] = el }}
                                    onClick={() => onClose?.()}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded px-3 py-2.5 transition-all duration-200",
                                        "font-mono text-xs",
                                        isActive
                                            ? "text-white bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]"
                                            : "text-[#8899aa] hover:text-white hover:bg-[rgba(0,212,255,0.04)] border border-transparent"
                                    )}
                                >
                                    {/* Active left bar */}
                                    <div className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r transition-all duration-300",
                                        isActive ? "h-4/5 opacity-100" : "h-0 opacity-0 group-hover:h-1/2 group-hover:opacity-50"
                                    )}
                                        style={{ backgroundColor: item.color }}
                                    />

                                    <Icon className="h-4 w-4 shrink-0 transition-all duration-200"
                                        style={{ color: isActive ? item.color : undefined }} />

                                    <span className="flex-1 truncate tracking-wide">{item.label}</span>

                                    {isActive && (
                                        <ChevronRight className="h-3 w-3 shrink-0" style={{ color: item.color }} />
                                    )}

                                    {/* Hover glow bg */}
                                    {!isActive && (
                                        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            style={{ background: `radial-gradient(ellipse at left center, ${item.color}08, transparent 70%)` }} />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mini stats */}
                    <div className="space-y-2">
                        <p className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/30 uppercase px-2">LIVE STATS</p>
                        <div className="grid grid-cols-2 gap-2">
                            {miniStats.map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div key={stat.label}
                                        className="relative flex flex-col items-center gap-1 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-2 text-center overflow-hidden">
                                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: `radial-gradient(circle at center, ${stat.color}08, transparent 70%)` }} />
                                        <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                                        <span className="font-mono text-base font-bold" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}60` }}>
                                            {isLoading ? "—" : (stat.value?.toLocaleString("vi-VN") ?? "—")}
                                        </span>
                                        <span className="font-mono text-[9px] text-[#8899aa] leading-tight">{stat.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Emergency hotlines */}
                    <div className="space-y-2">
                        <p className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/30 uppercase px-2">EMERGENCY HOTLINES</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ label: "Police", number: "113" }, { label: "Fire", number: "114" }, { label: "Ambulance", number: "115" }].map((c) => (
                                <a key={c.number} href={`tel:${c.number}`}
                                    className="group flex flex-col items-center gap-1 rounded border border-[rgba(255,59,59,0.2)] bg-[rgba(255,59,59,0.04)] p-2 text-center hover:border-[rgba(255,59,59,0.5)] hover:bg-[rgba(255,59,59,0.08)] transition-all duration-200">
                                    <Phone className="h-3.5 w-3.5 text-[#ff3b3b]" />
                                    <span className="font-mono text-sm font-bold text-[#ff3b3b]">{c.number}</span>
                                    <span className="font-mono text-[9px] text-[#8899aa]">{c.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-2 border-t border-[rgba(255,59,59,0.15)]">
                        <Link href="/map" onClick={() => onClose?.()}
                            className="group relative flex items-center justify-between rounded border border-[rgba(255,59,59,0.4)] bg-[rgba(255,59,59,0.08)] hover:bg-[rgba(255,59,59,0.15)] px-4 py-3 transition-all duration-200 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,59,59,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="font-mono text-xs font-bold text-[#ff3b3b] uppercase tracking-widest relative z-10">SUBMIT REPORT</span>
                            <ChevronRight className="h-4 w-4 text-[#ff3b3b] group-hover:translate-x-1 transition-transform relative z-10" />
                        </Link>
                    </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-20" />
            </aside>
        </>
    )
}
