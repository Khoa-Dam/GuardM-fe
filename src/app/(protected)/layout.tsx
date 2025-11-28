import { SidebarProvider } from "@/components/ui/sidebar"
import SidebarWrapper from "@/components/sidebar-wrapper"
import { AppHeader } from "@/components/app-header"
import { siteConfig } from "@/config/site.config"
import { Metadata } from "next"
import { SidebarStateProvider } from "@/components/sidebar-context"

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarStateProvider>
            <SidebarProvider>
                <div className="flex h-screen overflow-hidden">
                    <SidebarWrapper />

                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <AppHeader />
                        <main className="container flex-1 p-1.5 md:p-3.5">{children}</main>
                    </div>
                </div>
            </SidebarProvider>
        </SidebarStateProvider>
    )
}



