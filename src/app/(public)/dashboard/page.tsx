"use client"

import { useState, useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Siren } from "lucide-react"

import { Metadata } from "next"


export default function DashboardPage() {
    // === DỮ LIỆU MẪU ===
    const data = [
        { month: "T1", cases: 25 },
        { month: "T2", cases: 40 },
        { month: "T3", cases: 35 },
        { month: "T4", cases: 50 },
        { month: "T5", cases: 28 },
        { month: "T6", cases: 60 },
        { month: "T7", cases: 45 },
        { month: "T8", cases: 70 },
        { month: "T9", cases: 55 },
        { month: "T10", cases: 80 },
        { month: "T11", cases: 65 },
        { month: "T12", cases: 90 },
    ]

    const people = [
        { name: "Nguyễn Văn A", crime: "Giết người", birthPlace: "Bến Tre", birthDate: "2000" },
        { name: "Trần Văn B", crime: "Trộm cắp", birthPlace: "HCM", birthDate: "1997" },
        { name: "Lê Thị C", crime: "Hiếp dâm", birthPlace: "Thanh Hóa", birthDate: "1985" },
        { name: "Phạm Văn D", crime: "Buôn ma túy", birthPlace: "Hà Nội", birthDate: "1992" },
        { name: "Võ Văn E", crime: "Cướp tài sản", birthPlace: "Đà Nẵng", birthDate: "1995" },
        { name: "Trần Thị F", crime: "Tham ô", birthPlace: "Bình Thuận", birthDate: "1988" },
        { name: "Nguyễn Văn G", crime: "Giết người", birthPlace: "Cần Thơ", birthDate: "1999" },
        { name: "Phan Văn H", crime: "Cướp giật", birthPlace: "Bắc Ninh", birthDate: "1981" },
        { name: "Lê Văn I", crime: "Hiếp dâm", birthPlace: "Long An", birthDate: "1987" },
        { name: "Nguyễn Thị K", crime: "Tham ô", birthPlace: "Hà Tĩnh", birthDate: "1980" },
        { name: "Phạm Văn L", crime: "Cướp giật", birthPlace: "Đồng Nai", birthDate: "1993" },
        { name: "Lê Thị M", crime: "Giết người", birthPlace: "Sóc Trăng", birthDate: "1986" },
    ]

    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    // === LỌC & PHÂN TRANG ===
    const filteredPeople = useMemo(() => {
        const filtered = people.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
        setCurrentPage(1) // reset về trang đầu khi tìm
        return filtered
    }, [search])

    const totalPages = Math.ceil(filteredPeople.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentPeople = filteredPeople.slice(startIndex, startIndex + itemsPerPage)

    const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages))
    const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1))

    // === JSX ===
    return (
        <div className="space-y-6">
            {/* === THANH TÌM KIẾM === */}
            <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-3 bg-white shadow rounded-xl p-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Nhập họ tên đối tượng truy nã..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-amber-600 text-white px-5 py-2 rounded-md hover:bg-amber-700 transition"
                >
                    Tìm kiếm
                </button>
            </form>

            {/* === DANH SÁCH === */}
            <section className="bg-white p-6 shadow rounded-xl">
                <h2 className="text-lg font-bold mb-4">
                    Hiển thị {currentPeople.length} / {filteredPeople.length} đối tượng
                </h2>

                <div className="grid grid-cols-3 gap-4">
                    {currentPeople.map((p, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg pb-3 border border-amber-500">
                            <div className="font-semibold flex p-1 items-center gap-x-1 bg-amber-400 rounded-tl-lg rounded-tr-lg">
                                <Siren color="red"></Siren>
                                Đối tượng truy nã thường
                            </div>
                            <div className="text-center pt-2">
                                <div className="w-20 h-20 mx-auto bg-gray-300 rounded-full  mb-3"></div>
                                <h3 className="font-semibold text-red-600">{p.name}</h3>
                                <p className="text-sm text-gray-500">Năm sinh: {p.birthDate}</p>
                                <p className="text-sm text-gray-500">Tội danh: {p.crime}</p>
                                <p className="text-sm text-gray-500">Nơi thường trú: {p.birthPlace}</p>
                            </div>
                        </div>
                    ))}
                    {currentPeople.length === 0 && (
                        <p className="col-span-3 text-center text-gray-500">Không tìm thấy đối tượng nào.</p>
                    )}
                </div>

                {/* === PHÂN TRANG === */}
                {filteredPeople.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="p-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-sm">
                            Trang <span className="font-semibold">{currentPage}</span> / {totalPages}
                        </span>

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </section>

            {/* === THỐNG KÊ NHANH === */}
            <section className="grid grid-cols-3 gap-6">
                {[
                    { label: "Số vụ việc", value: 128 },
                    { label: "Số người bị bắt", value: 56 },
                    { label: "Đang truy nã", value: 72 },
                ].map((item, i) => (
                    <div key={i} className="bg-white shadow rounded-xl p-5 text-center">
                        <h3 className="text-gray-500 text-sm">{item.label}</h3>
                        <p className="text-3xl font-semibold text-amber-600">{item.value}</p>
                    </div>
                ))}
            </section>

            {/* === BIỂU ĐỒ === */}
            <section className="bg-white p-6 shadow rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Thống kê vụ việc theo tháng</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cases" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* === THÔNG BÁO === */}
            <section className="bg-white p-6 shadow rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Thông báo mới nhất</h2>
                <ul className="space-y-2 text-sm">
                    <li>• Vụ cướp tại Quận 5 đã được phá án thành công (1/11/2025)</li>
                    <li>• Thêm 3 nghi phạm mới vào danh sách truy nã (31/10/2025)</li>
                    <li>• Cập nhật hệ thống nhận diện khuôn mặt phiên bản mới (29/10/2025)</li>
                </ul>
            </section>


        </div>
    )
}

