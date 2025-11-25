import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { siteConfig } from "@/config/site.config"
import { Logo } from "@/components/icons"
import Link from "next/link"
export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
}

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    // const isLoggedIn = !!session
    const isLoggedIn = true

    // Nếu đã đăng nhập, hiển thị layout có Sidebar
    if (isLoggedIn) {
        return (
            <SidebarProvider>
                <div className="flex h-screen">
                    <AppSidebar />

                    <div className="flex flex-col grow flex-1 bg-gray-50">
                        <div>
                            <AppHeader />
                        </div>
                        <main className="p-6 overflow-y-auto">{children}</main>
                    </div>
                </div>
            </SidebarProvider>
        )
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header đơn giản cho public pages */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link
                            aria-label="Go to home page"
                            href="/"
                            className="flex items-center gap-2 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Logo size={48} style={{ color: 'red' }} />
                        </Link>
                        <h1 className="text-xl font-bold text-amber-600">
                            Hệ thống tra cứu tội phạm truy nã
                        </h1>
                    </div>

                    <nav className="flex items-center gap-4">
                        <a href="/login" className="text-gray-600 hover:text-amber-600 transition">
                            Đăng nhập
                        </a>
                        <a
                            href="/signup"
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition"
                        >
                            Đăng ký
                        </a>
                    </nav>
                </div>
            </header>
            <main className="container ">
                {children}
            </main>
        </div>
    )
}

