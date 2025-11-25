"use client"

import { Logo } from "./icons";
import { BookUser, MessageSquareWarning, MapPinned, Shield, Home, BarChart3, Search } from "lucide-react"
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

const items = [
    { title: "Trang chủ", icon: Home, url: "/" },
    { title: "Danh sách truy nã", icon: BookUser, url: "/crimeList" },
    { title: "Báo cáo", icon: MessageSquareWarning, url: "/reports" },
    { title: "Bản đồ", icon: MapPinned, url: "/map" },
    { title: "Thống kê & Phân tích", icon: BarChart3, url: "/statistics" },
    { title: "Tìm kiếm nâng cao", icon: Search, url: "/search" },
]

export function AppSidebar() {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>

                    <SidebarGroupLabel>
                        <div className="w-full flex justify-center">
                            <Logo></Logo>
                        </div>
                        <div className="">
                            CrimeLookup
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url}
                                                className={`flex items-center border border-[#ccc]  gap-3 w-full p-2 rounded-md transition ${isActive
                                                    ? "text-gray-800 bg-amber-500 font-semibold"
                                                    : "hover:bg-amber-500 text-gray-800"
                                                    }`}>
                                                <item.icon size={16} />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
