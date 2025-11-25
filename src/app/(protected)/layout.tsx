import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { siteConfig } from "@/config/site.config"
import { Metadata } from "next"
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
        <SidebarProvider>
            <div className="flex h-screen">
                <AppSidebar />

                <div className="flex flex-col grow flex-1 bg-gray-50">
                    <div>
                        <AppHeader />
                    </div>
                    <main className="container p-3 mx-auto">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}



