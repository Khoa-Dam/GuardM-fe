"use client"

import { useState, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, Send, Award, FileText, Upload, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Metadata } from "next"
import { siteConfig } from "@/config/site.config"


export default function ReportsPage() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    crimeType: '',
    description: '',
    files: [] as File[],
    isAnonymous: false
  });

  // Search state
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  interface Report {
    id: number;
    title: string;
    reporter: string;
    date: string;
    status: string;
    points: number;
  }

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const itemsPerPage = 6

  // Sample data for charts
  const reportStats = [
    { month: "T1", reports: 15 },
    { month: "T2", reports: 25 },
    { month: "T3", reports: 20 },
    { month: "T4", reports: 30 },
    { month: "T5", reports: 18 },
    { month: "T6", reports: 35 },
    { month: "T7", reports: 28 },
    { month: "T8", reports: 40 },
    { month: "T9", reports: 32 },
    { month: "T10", reports: 45 },
    { month: "T11", reports: 38 },
    { month: "T12", reports: 50 },
  ]

  // Sample data for reports
  const reports = useMemo(() => [
    {
      id: 1,
      title: "Báo cáo vụ trộm xe máy",
      reporter: "Nguyễn Văn A",
      date: "01/11/2025",
      status: "Đã xử lý",
      points: 85
    },
    {
      id: 2,
      title: "Phát hiện đối tượng khả nghi",
      reporter: "Trần Thị B",
      date: "02/11/2025",
      status: "Đang xác minh",
      points: 92
    },
    {
      id: 3,
      title: "Phát hiện đối tượng khả nghi",
      reporter: "Trần Thị B",
      date: "02/11/2025",
      status: "Đang xác minh",
      points: 92
    },
    {
      id: 4,
      title: "Phát hiện đối tượng khả nghi",
      reporter: "Trần Thị B",
      date: "02/11/2025",
      status: "Đang xác minh",
      points: 92
    },
    {
      id: 5,
      title: "Phát hiện đối tượng khả nghi",
      reporter: "Trần Thị B",
      date: "02/11/2025",
      status: "Đang xác minh",
      points: 92
    },
    {
      id: 6,
      title: "Báo cáo hoạt động đáng ngờ",
      reporter: "Lê Văn C",
      date: "03/11/2025",
      status: "Đang xác minh",
      points: 78
    }
  ], [])

  const areas = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Bình Thạnh', 'Tân Bình', 'Thủ Đức'
  ];

  const crimeTypes = [
    'Trộm cắp',
    'Cướp giật',
    'Ma túy',
    'Gây rối trật tự',
    'Khác'
  ];

  // Form handlers
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.isAnonymous) {
      if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên"
      if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email"
      if (!formData.phone?.trim()) newErrors.phone = "Vui lòng nhập số điện thoại"
    }

    if (!formData.area) newErrors.area = "Vui lòng chọn khu vực"
    if (!formData.crimeType) newErrors.crimeType = "Vui lòng chọn loại tội phạm"
    if (!formData.description.trim()) newErrors.description = "Vui lòng nhập mô tả"
    if (!formData.files || formData.files.length === 0) newErrors.files = "Vui lòng chọn ít nhất 1 file"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    alert("Báo cáo đã được gửi thành công!")
    setFormData({
      name: '',
      email: '',
      phone: '',
      area: '',
      crimeType: '',
      description: '',
      files: [],
      isAnonymous: false
    })
    setErrors({})
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, files }))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setFormData(prev => ({ ...prev, files }))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!search) return reports;
    return reports.filter(report =>
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.reporter.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, reports]);

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-3 bg-white shadow rounded-xl p-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Tìm kiếm báo cáo"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-amber-500 text-white px-5 py-2 rounded-md hover:bg-amber-700 transition cursor-pointer"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Thống kê nhanh */}
      <section className="grid grid-cols-3 gap-6">
        {[
          { label: "Tổng số báo cáo", value: 234, icon: FileText },
          { label: "Đã xử lý", value: 156, icon: Send },
          { label: "Người báo cáo tích cực", value: 45, icon: Award },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <item.icon className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">{item.label}</h3>
              <p className="text-2xl font-semibold text-amber-600">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Form báo cáo */}
      <section className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Send size={20} />
          Gửi báo cáo mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Họ tên */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên người gửi</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={formData.isAnonymous}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'error-name' : undefined}
              />
              {errors.name && <p id="error-name" className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email + Số điện thoại (cùng hàng trên desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={formData.isAnonymous}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && <p id="error-email" className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  pattern="[0-9]{10}"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={formData.isAnonymous}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                />
                {errors.phone && <p id="error-phone" className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Khu vực */}
            <div className="space-y-2">
              <Label htmlFor="area">Khu vực xảy ra vụ việc</Label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.area ? 'border-red-600' : 'border-gray-300'}`}
                aria-invalid={!!errors.area}
                aria-describedby={errors.area ? 'error-area' : undefined}
              >
                <option value="">Chọn khu vực</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {errors.area && <p id="error-area" className="text-sm text-red-600 mt-1">{errors.area}</p>}
            </div>

            {/* Loại tội phạm */}
            <div className="space-y-2">
              <Label htmlFor="crimeType">Loại tội phạm</Label>
              <select
                id="crimeType"
                name="crimeType"
                value={formData.crimeType}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.crimeType ? 'border-red-600' : 'border-gray-300'}`}
                aria-invalid={!!errors.crimeType}
                aria-describedby={errors.crimeType ? 'error-crimeType' : undefined}
              >
                <option value="">Chọn loại tội phạm</option>
                {crimeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.crimeType && <p id="error-crimeType" className="text-sm text-red-600 mt-1">{errors.crimeType}</p>}
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết vụ việc</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-600' : 'border-gray-300'}`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'error-description' : undefined}
            />
            {errors.description && <p id="error-description" className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Upload file: kéo thả hoặc click */}
          <div className="space-y-2">
            <Label>Ảnh hoặc video minh chứng</Label>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer ${errors.files ? 'border-red-600' : 'border-gray-300'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Kéo thả file vào đây hoặc click để chọn file</p>
                <p className="mt-1 text-xs text-gray-400">Hỗ trợ: JPG, PNG, MP4. Tối đa 5 file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>
            {errors.files && <p className="text-sm text-red-600 mt-1">{errors.files}</p>}

            {/* Preview file list */}
            {formData.files.length > 0 && (
              <div className="grid gap-2 mt-3">
                {formData.files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-xs">
                        {f.type.startsWith('image') ? 'IMG' : 'VID'}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium truncate max-w-xs">{f.name}</div>
                        <div className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded-md hover:bg-gray-100">
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ẩn danh */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <Label htmlFor="isAnonymous">Tôi muốn gửi ẩn danh</Label>
          </div>

          <Button
            type="submit"
            className="block w-[25%] bg-amber-600 hover:bg-amber-700 mx-auto cursor-pointer"
          >
            Gửi báo cáo
          </Button>

        </form>
      </section>

      {/* Biểu đồ thống kê */}
      <section className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Thống kê báo cáo theo tháng</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportStats} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Danh sách báo cáo và xếp hạng */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Danh sách báo cáo */}
        <section className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FileText size={20} />
            Danh sách báo cáo gần đây
          </h2>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${report.status === 'Đã xử lý'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Người gửi: {report.reporter}</p>
                  <p className="text-sm text-gray-500">Ngày: {report.date}</p>
                  <p className="text-sm text-amber-600">Điểm uy tín: {report.points}</p>
                  <Button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowModal(true);
                    }}
                    variant="outline"
                    className="block mx-auto w-[25%] cursor-pointer bg-amber-500 hover:bg-amber-700"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Xếp hạng người báo cáo */}
        <section className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Award size={20} />
            Xếp hạng người báo cáo tích cực
          </h2>

          <div className="space-y-4">
            {reports.sort((a, b) => b.points - a.points).map((reporter, index) => (
              <div key={reporter.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-400' :
                  index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-amber-600' : 'bg-gray-200'
                  } text-white font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{reporter.reporter}</h3>
                  <p className="text-sm text-gray-500">Điểm uy tín: {reporter.points}</p>
                </div>
                <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {reporter.points > 90 ? 'Người cảnh giác' : 'Cộng tác viên an ninh'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Chi tiết báo cáo */}
      {
        showModal && selectedReport && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Card className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-xl">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold">Chi tiết báo cáo</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{selectedReport.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${selectedReport.status === 'Đã xử lý'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedReport.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Người báo cáo</p>
                        <p className="font-medium">{selectedReport.reporter}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Ngày báo cáo</p>
                        <p className="font-medium">{selectedReport.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Điểm uy tín</p>
                        <p className="font-medium text-amber-600">{selectedReport.points} điểm</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Khu vực</p>
                        <p className="font-medium">Quận 1, TP.HCM</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-2">Mô tả chi tiết</p>
                      <p className="text-sm bg-gray-50 p-4 rounded-lg">
                        Phát hiện đối tượng khả nghi thường xuyên đi lại khu vực vào buổi tối.
                        Đặc điểm nhận dạng: Nam, khoảng 30 tuổi, cao 1m70, đi xe máy Wave màu đen.
                        Thời gian hoạt động: 22h - 24h hàng ngày.
                      </p>
                    </div>

                    {/* Hình ảnh đính kèm */}
                    <div>
                      <p className="text-gray-500 mb-2">Hình ảnh đính kèm</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          Hình ảnh 1
                        </div>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          Hình ảnh 2
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú từ cơ quan chức năng */}
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2">Phản hồi từ cơ quan chức năng</p>
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                        Đã tiếp nhận thông tin và đang trong quá trình xác minh.
                        Cảm ơn bạn đã cung cấp thông tin có giá trị.
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="mr-2"
                    >
                      Đóng
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Cập nhật thông tin
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )
      }
    </div>

  )
}