"use client"

import { BookUser, MessageSquareWarning, MapPinned, Trophy } from "lucide-react"
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
    { title: "Danh sách truy nã", icon: BookUser, url: "/" },
    { title: "Báo cáo", icon: MessageSquareWarning, url: "/reports" },
    { title: "Bản đồ", icon: MapPinned, url: "/map" },
]

export function AppSidebar() {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Tra cứu tội phạm</SidebarGroupLabel>
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
