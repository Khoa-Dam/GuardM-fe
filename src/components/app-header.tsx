"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Settings, LogOut, ChevronDown } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"

export function AppHeader() {
    const { userName, userRole } = useUser()
    const router = useRouter()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await signOut({
            redirect: false,
            callbackUrl: "/login"
        })
        router.push("/login")
        router.refresh()
    }

    return (
        <header className="flex items-center justify-between bg-white shadow px-6 py-3 border-b">
            {/* Bên trái: tiêu đề */}
            <h1 className="text-lg font-semibold text-gray-700">
                Hệ thống tra cứu tội phạm truy nã
            </h1>

            {/* Bên phải: avatar + tên người dùng */}
            <div className="flex items-center gap-4">
                {/* Icon thông báo */}
                <button className="relative hover:text-amber-600 transition">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1 rounded-md transition"
                    >
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="avatar"
                            className="w-9 h-9 rounded-full border"
                        />
                        <div className="text-sm text-left hidden md:block">
                            <p className="font-medium">{userName}</p>
                            <p className="text-gray-500 text-xs">{userRole}</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                <p className="font-medium text-sm">{userName}</p>
                                <p className="text-gray-500 text-xs">{userRole}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false)
                                    router.push("/settings")
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                <Settings size={16} />
                                <span>Cài đặt</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
