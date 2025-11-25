import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileWarning, MapPin, TrendingUp, AlertTriangle, Clock, Shield, Eye, Bell } from "lucide-react"

const stats = [
    {
        title: "Tổng đối tượng truy nã",
        value: "1,234",
        description: "+12% so với tháng trước",
        icon: Users,
        trend: "up",
    },
    {
        title: "Báo cáo mới",
        value: "89",
        description: "Trong 7 ngày qua",
        icon: FileWarning,
        trend: "up",
    },
    {
        title: "Điểm nóng",
        value: "15",
        description: "Khu vực cần theo dõi",
        icon: MapPin,
        trend: "neutral",
    },
    {
        title: "Đã bắt giữ",
        value: "56",
        description: "Trong tháng này",
        icon: TrendingUp,
        trend: "up",
    },
]

const recentActivities = [
    {
        id: 1,
        type: "Cập nhật",
        message: "Thêm mới đối tượng truy nã #TN-2025-0089",
        time: "5 phút trước",
        status: "new",
    },
    {
        id: 2,
        type: "Báo cáo",
        message: "Phát hiện đối tượng tại quận Cầu Giấy",
        time: "15 phút trước",
        status: "pending",
    },
    {
        id: 3,
        type: "Bắt giữ",
        message: "Đối tượng #TN-2025-0045 đã bị bắt",
        time: "1 giờ trước",
        status: "success",
    },
    {
        id: 4,
        type: "Cảnh báo",
        message: "Điểm nóng mới phát hiện tại quận Hoàng Mai",
        time: "2 giờ trước",
        status: "warning",
    },
]

const wantedPersons = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        alias: "A Béo",
        crime: "Cướp tài sản",
        status: "Đang truy nã",
        dangerLevel: "high",
        lastSeen: "Hà Nội",
    },
    {
        id: 2,
        name: "Trần Văn B",
        alias: "B Sẹo",
        crime: "Lừa đảo chiếm đoạt tài sản",
        status: "Đang truy nã",
        dangerLevel: "medium",
        lastSeen: "TP. Hồ Chí Minh",
    },
    {
        id: 3,
        name: "Lê Thị C",
        alias: "C Đen",
        crime: "Buôn bán ma túy",
        status: "Đang truy nã",
        dangerLevel: "high",
        lastSeen: "Đà Nẵng",
    },
]

const regionStats = [
    { region: "Miền Bắc", total: 456, caught: 23, percentage: 37 },
    { region: "Miền Trung", total: 289, caught: 12, percentage: 23 },
    { region: "Miền Nam", total: 489, caught: 21, percentage: 40 },
]

const systemNotices = [
    {
        id: 1,
        title: "Cập nhật hệ thống",
        content: "Hệ thống sẽ bảo trì vào 22:00 ngày 26/11/2025",
        type: "info",
    },
    {
        id: 2,
        title: "Cảnh báo an ninh",
        content: "Phát hiện hoạt động đáng ngờ tại khu vực biên giới phía Bắc",
        type: "warning",
    },
]

export default function Page() {
    return (
        <SidebarProvider>
            <SidebarInset>
                <header className="flex h-14 md:h-16 font-semibold text-xl items-center gap-2 md:gap-4 border-b border-border  px-4 md:px-6">
                    Trang chủ
                </header>
                <main className="flex-1 p-4 md:p-6">
                    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <Card key={stat.title}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                            {/* Recent Activities */}
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                        Hoạt động gần đây
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Các cập nhật mới nhất trong hệ thống</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 md:space-y-4">
                                        {recentActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-2 md:gap-3 rounded-lg border border-border p-2 md:p-3"
                                            >
                                                <div className="mt-0.5">
                                                    {activity.status === "warning" ? (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    ) : activity.status === "success" ? (
                                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <FileWarning className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Badge variant="secondary" className="text-xs shrink-0">
                                                            {activity.type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                                    </div>
                                                    <p className="text-xs md:text-sm truncate">{activity.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="text-base md:text-lg">Truy cập nhanh</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Các chức năng thường dùng</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 md:gap-3">
                                        <a
                                            href="/wanted"
                                            className="flex items-center gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-accent"
                                        >
                                            <Users className="h-5 w-5 text-primary shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm md:text-base">Danh sách truy nã</p>
                                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                                    Xem và quản lý đối tượng truy nã
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            href="/reports"
                                            className="flex items-center gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-accent"
                                        >
                                            <FileWarning className="h-5 w-5 text-primary shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm md:text-base">Báo cáo</p>
                                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                                    Gửi và xem các báo cáo tin tức
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            href="/map"
                                            className="flex items-center gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-accent"
                                        >
                                            <MapPin className="h-5 w-5 text-primary shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm md:text-base">Bản đồ</p>
                                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                                    Xem vị trí và điểm nóng tội phạm
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Wanted Persons */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                            <Eye className="h-4 w-4 md:h-5 md:w-5" />
                                            Đối tượng truy nã mới nhất
                                        </CardTitle>
                                        <CardDescription className="text-xs md:text-sm">Các đối tượng vừa được cập nhật</CardDescription>
                                    </div>
                                    <a href="/wanted" className="text-sm text-primary hover:underline">
                                        Xem tất cả
                                    </a>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {wantedPersons.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-accent"
                                        >
                                            <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                                <Users className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-semibold text-sm md:text-base truncate">{person.name}</p>
                                                    <Badge
                                                        variant={person.dangerLevel === "high" ? "destructive" : "secondary"}
                                                        className="text-xs shrink-0"
                                                    >
                                                        {person.dangerLevel === "high" ? "Nguy hiểm" : "Cảnh giác"}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Biệt danh: {person.alias}</p>
                                                <p className="text-xs text-muted-foreground truncate">Tội danh: {person.crime}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    <MapPin className="inline h-3 w-3 mr-1" />
                                                    {person.lastSeen}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Region Stats and System Notices */}
                        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                            {/* Region Stats */}
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Shield className="h-4 w-4 md:h-5 md:w-5" />
                                        Thống kê theo khu vực
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Phân bố đối tượng truy nã toàn quốc</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {regionStats.map((region) => (
                                            <div key={region.region} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{region.region}</span>
                                                    <span className="text-muted-foreground">
                                                        {region.total} đối tượng ({region.caught} đã bắt)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{ width: `${region.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-border">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold">Tổng cộng</span>
                                                <span className="font-semibold">1,234 đối tượng</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Notices */}
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Bell className="h-4 w-4 md:h-5 md:w-5" />
                                        Thông báo hệ thống
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Các thông báo quan trọng</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 md:space-y-4">
                                        {systemNotices.map((notice) => (
                                            <div
                                                key={notice.id}
                                                className={`rounded-lg border p-3 md:p-4 ${notice.type === "warning"
                                                    ? "border-amber-500/50 bg-amber-500/10"
                                                    : "border-blue-500/50 bg-blue-500/10"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {notice.type === "warning" ? (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                    ) : (
                                                        <Bell className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                                    )}
                                                    <div className="space-y-1 min-w-0">
                                                        <p className="font-medium text-sm">{notice.title}</p>
                                                        <p className="text-xs md:text-sm text-muted-foreground">{notice.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
