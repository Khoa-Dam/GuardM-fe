import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    MapPin,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"

const overviewStats = [
    {
        title: "Tổng đối tượng",
        value: "1,234",
        change: "+12%",
        trend: "up",
        description: "So với tháng trước",
    },
    {
        title: "Đã bắt giữ",
        value: "156",
        change: "+23%",
        trend: "up",
        description: "So với tháng trước",
    },
    {
        title: "Đang truy nã",
        value: "1,078",
        change: "-5%",
        trend: "down",
        description: "So với tháng trước",
    },
    {
        title: "Tỷ lệ thành công",
        value: "12.6%",
        change: "+2.1%",
        trend: "up",
        description: "So với tháng trước",
    },
]

const crimeTypes = [
    { type: "Cướp tài sản", count: 234, percentage: 19, color: "bg-red-500" },
    { type: "Lừa đảo", count: 312, percentage: 25, color: "bg-amber-500" },
    { type: "Ma túy", count: 189, percentage: 15, color: "bg-purple-500" },
    { type: "Trộm cắp", count: 267, percentage: 22, color: "bg-blue-500" },
    { type: "Giết người", count: 89, percentage: 7, color: "bg-rose-600" },
    { type: "Khác", count: 143, percentage: 12, color: "bg-gray-500" },
]

const monthlyData = [
    { month: "T1", caught: 12, new: 45 },
    { month: "T2", caught: 18, new: 38 },
    { month: "T3", caught: 15, new: 52 },
    { month: "T4", caught: 22, new: 41 },
    { month: "T5", caught: 28, new: 35 },
    { month: "T6", caught: 19, new: 48 },
    { month: "T7", caught: 24, new: 39 },
    { month: "T8", caught: 31, new: 44 },
    { month: "T9", caught: 27, new: 36 },
    { month: "T10", caught: 35, new: 42 },
    { month: "T11", caught: 29, new: 38 },
    { month: "T12", caught: 56, new: 47 },
]

const ageGroups = [
    { group: "18-25 tuổi", count: 312, percentage: 25 },
    { group: "26-35 tuổi", count: 456, percentage: 37 },
    { group: "36-45 tuổi", count: 289, percentage: 23 },
    { group: "46-55 tuổi", count: 123, percentage: 10 },
    { group: "Trên 55 tuổi", count: 54, percentage: 5 },
]

const topProvinces = [
    { name: "TP. Hồ Chí Minh", count: 234, trend: "up" },
    { name: "Hà Nội", count: 198, trend: "up" },
    { name: "Đà Nẵng", count: 87, trend: "down" },
    { name: "Bình Dương", count: 76, trend: "up" },
    { name: "Đồng Nai", count: 65, trend: "down" },
]

export default function StatisticsPage() {
    const maxMonthlyValue = Math.max(...monthlyData.map((d) => Math.max(d.caught, d.new)))

    return (
        <SidebarProvider>
            <SidebarInset>
                <header className="flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border bg-background px-4 md:px-6">
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-lg md:text-xl font-semibold">Thống kê & Phân tích</h1>
                        <Badge variant="outline" className="hidden sm:flex gap-1">
                            <Calendar className="h-3 w-3" />
                            Năm 2025
                        </Badge>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6">
                    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                        {/* Overview Stats */}
                        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {overviewStats.map((stat) => (
                                <Card key={stat.title}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                        {stat.trend === "up" ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                                            {stat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                            {/* Monthly Trend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                                        Xu hướng theo tháng
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">
                                        So sánh số đối tượng mới và đã bắt giữ
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end gap-1 md:gap-2 h-48 md:h-64">
                                        {monthlyData.map((data) => (
                                            <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex gap-0.5 h-40 md:h-52 items-end">
                                                    <div
                                                        className="flex-1 bg-primary/80 rounded-t transition-all hover:bg-primary"
                                                        style={{ height: `${(data.new / maxMonthlyValue) * 100}%` }}
                                                        title={`Mới: ${data.new}`}
                                                    />
                                                    <div
                                                        className="flex-1 bg-green-500/80 rounded-t transition-all hover:bg-green-500"
                                                        style={{ height: `${(data.caught / maxMonthlyValue) * 100}%` }}
                                                        title={`Bắt giữ: ${data.caught}`}
                                                    />
                                                </div>
                                                <span className="text-[10px] md:text-xs text-muted-foreground">{data.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 text-xs md:text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded bg-primary" />
                                            <span>Mới</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded bg-green-500" />
                                            <span>Đã bắt</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Crime Types */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                                        Phân loại tội phạm
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Thống kê theo loại tội danh</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 md:space-y-4">
                                        {crimeTypes.map((crime) => (
                                            <div key={crime.type} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{crime.type}</span>
                                                    <span className="text-muted-foreground">
                                                        {crime.count} ({crime.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${crime.color} transition-all`}
                                                        style={{ width: `${crime.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Age and Location */}
                        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                            {/* Age Groups */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Users className="h-4 w-4 md:h-5 md:w-5" />
                                        Phân bố theo độ tuổi
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Nhóm tuổi đối tượng truy nã</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 md:space-y-4">
                                        {ageGroups.map((age) => (
                                            <div key={age.group} className="flex items-center gap-3">
                                                <span className="w-24 md:w-28 text-sm font-medium shrink-0">{age.group}</span>
                                                <div className="flex-1 h-8 rounded-lg bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary flex items-center justify-end pr-2 transition-all"
                                                        style={{ width: `${age.percentage}%` }}
                                                    >
                                                        <span className="text-xs text-primary-foreground font-medium">{age.count}</span>
                                                    </div>
                                                </div>
                                                <span className="w-10 text-right text-sm text-muted-foreground">{age.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Provinces */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                                        Top tỉnh/thành phố
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">Khu vực có nhiều đối tượng nhất</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topProvinces.map((province, index) => (
                                            <div
                                                key={province.name}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{province.name}</p>
                                                    <p className="text-xs text-muted-foreground">{province.count} đối tượng</p>
                                                </div>
                                                {province.trend === "up" ? (
                                                    <TrendingUp className="h-4 w-4 text-red-500 shrink-0" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-green-500 shrink-0" />
                                                )}
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
