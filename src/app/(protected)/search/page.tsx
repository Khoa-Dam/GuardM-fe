"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, MapPin, Calendar, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"

const searchResults = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        alias: "A Béo",
        age: 35,
        gender: "Nam",
        crime: "Cướp tài sản",
        status: "Đang truy nã",
        dangerLevel: "high",
        lastSeen: "Hà Nội",
        wantedDate: "15/03/2025",
    },
    {
        id: 2,
        name: "Trần Văn B",
        alias: "B Sẹo",
        age: 42,
        gender: "Nam",
        crime: "Lừa đảo chiếm đoạt tài sản",
        status: "Đang truy nã",
        dangerLevel: "medium",
        lastSeen: "TP. Hồ Chí Minh",
        wantedDate: "22/05/2025",
    },
    {
        id: 3,
        name: "Lê Thị C",
        alias: "C Đen",
        age: 28,
        gender: "Nữ",
        crime: "Buôn bán ma túy",
        status: "Đang truy nã",
        dangerLevel: "high",
        lastSeen: "Đà Nẵng",
        wantedDate: "08/01/2025",
    },
    {
        id: 4,
        name: "Phạm Văn D",
        alias: "D Lùn",
        age: 31,
        gender: "Nam",
        crime: "Trộm cắp tài sản",
        status: "Đang truy nã",
        dangerLevel: "low",
        lastSeen: "Cần Thơ",
        wantedDate: "30/07/2025",
    },
    {
        id: 5,
        name: "Hoàng Văn E",
        alias: "E Sứt",
        age: 45,
        gender: "Nam",
        crime: "Giết người",
        status: "Đang truy nã",
        dangerLevel: "high",
        lastSeen: "Nghệ An",
        wantedDate: "12/09/2025",
    },
]

const provinces = ["Tất cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Nghệ An", "Bình Dương", "Đồng Nai"]

const crimeTypes = ["Tất cả", "Cướp tài sản", "Lừa đảo", "Ma túy", "Trộm cắp", "Giết người", "Khác"]

export default function SearchPage() {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        province: "Tất cả",
        crimeType: "Tất cả",
        dangerLevel: "Tất cả",
        gender: "Tất cả",
        ageFrom: "",
        ageTo: "",
    })

    const resetFilters = () => {
        setSearchQuery("")
        setFilters({
            province: "Tất cả",
            crimeType: "Tất cả",
            dangerLevel: "Tất cả",
            gender: "Tất cả",
            ageFrom: "",
            ageTo: "",
        })
    }

    const activeFiltersCount = Object.values(filters).filter((v) => v !== "Tất cả" && v !== "").length

    return (
        <SidebarProvider>
            <SidebarInset>
                <header className="flex h-14 md:h-16 font-semibold text-xl items-center gap-2 md:gap-4 border-b border-border  px-4 md:px-6">
                    Tìm kiếm nâng cao
                </header>

                <main className="flex-1 p-4 md:p-6">
                    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                        {/* Search Box */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-4">
                                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                                    Tìm kiếm đối tượng
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm">
                                    Nhập thông tin để tìm kiếm đối tượng trong hệ thống
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Main Search */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm theo tên, biệt danh, mã số..."
                                            className="pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button className="shrink-0">
                                        <Search className="h-4 w-4 mr-2" />
                                        Tìm kiếm
                                    </Button>
                                </div>

                                {/* Toggle Advanced */}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <span className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Bộ lọc nâng cao
                                        {activeFiltersCount > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {activeFiltersCount}
                                            </Badge>
                                        )}
                                    </span>
                                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>

                                {/* Advanced Filters */}
                                {showAdvanced && (
                                    <div className="space-y-4 pt-2 border-t border-border">
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                            {/* Province */}
                                            <div className="space-y-2">
                                                <Label className="text-sm">Tỉnh/Thành phố</Label>
                                                <Select
                                                    value={filters.province}
                                                    onValueChange={(value: string) => setFilters({ ...filters, province: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {provinces.map((p) => (
                                                            <SelectItem key={p} value={p}>
                                                                {p}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Crime Type */}
                                            <div className="space-y-2">
                                                <Label className="text-sm">Loại tội phạm</Label>
                                                <Select
                                                    value={filters.crimeType}
                                                    onValueChange={(value: string) => setFilters({ ...filters, crimeType: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {crimeTypes.map((c) => (
                                                            <SelectItem key={c} value={c}>
                                                                {c}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Danger Level */}
                                            <div className="space-y-2">
                                                <Label className="text-sm">Mức độ nguy hiểm</Label>
                                                <Select
                                                    value={filters.dangerLevel}
                                                    onValueChange={(value: string) => setFilters({ ...filters, dangerLevel: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Tất cả">Tất cả</SelectItem>
                                                        <SelectItem value="high">Nguy hiểm cao</SelectItem>
                                                        <SelectItem value="medium">Trung bình</SelectItem>
                                                        <SelectItem value="low">Thấp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Gender */}
                                            <div className="space-y-2">
                                                <Label className="text-sm">Giới tính</Label>
                                                <Select
                                                    value={filters.gender}
                                                    onValueChange={(value: string) => setFilters({ ...filters, gender: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Tất cả">Tất cả</SelectItem>
                                                        <SelectItem value="Nam">Nam</SelectItem>
                                                        <SelectItem value="Nữ">Nữ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Age Range */}
                                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                                <Label className="text-sm">Độ tuổi</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Từ"
                                                        value={filters.ageFrom}
                                                        onChange={(e) => setFilters({ ...filters, ageFrom: e.target.value })}
                                                    />
                                                    <span className="text-muted-foreground">-</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="Đến"
                                                        value={filters.ageTo}
                                                        onChange={(e) => setFilters({ ...filters, ageTo: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reset Button */}
                                        <div className="flex justify-end">
                                            <Button variant="outline" onClick={resetFilters}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Đặt lại bộ lọc
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Results */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base md:text-lg">Kết quả tìm kiếm</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">
                                            Tìm thấy {searchResults.length} đối tượng
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{searchResults.length} kết quả</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {searchResults.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 md:p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                                        >
                                            {/* Avatar */}
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                                    <Users className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-sm md:text-base">{person.name}</p>
                                                        <Badge
                                                            variant={
                                                                person.dangerLevel === "high"
                                                                    ? "destructive"
                                                                    : person.dangerLevel === "medium"
                                                                        ? "default"
                                                                        : "secondary"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {person.dangerLevel === "high"
                                                                ? "Nguy hiểm cao"
                                                                : person.dangerLevel === "medium"
                                                                    ? "Trung bình"
                                                                    : "Thấp"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-muted-foreground">
                                                        Biệt danh: {person.alias} | {person.gender}, {person.age} tuổi
                                                    </p>
                                                    <p className="text-xs md:text-sm text-muted-foreground">Tội danh: {person.crime}</p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {person.lastSeen}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {person.wantedDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex sm:flex-col gap-2 sm:justify-center sm:items-end shrink-0 mt-2 sm:mt-0">
                                                <Button size="sm" className="flex-1 sm:flex-none">
                                                    Xem chi tiết
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none bg-transparent">
                                                    Báo cáo
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
