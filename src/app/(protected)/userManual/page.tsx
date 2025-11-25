
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Clock, UserPlus, Send, FileText, Trophy, Shield, AlertTriangle, Search } from 'lucide-react';
const steps = [
    {
        icon: <UserPlus className="w-6 h-6" />,
        title: "Đăng nhập/Đăng ký tài khoản:",
        color: "from-blue-500 to-blue-600",
        items: [
            "Nhấn vào nút <b>Đăng nhập</b> hoặc <b>Đăng ký</b> ở góc trên cùng bên phải màn hình.",
            "Nhập đầy đủ thông tin cá nhân (họ tên, email, mật khẩu) để tạo tài khoản mới hoặc đăng nhập bằng tài khoản đã có.",
            "Sau khi đăng nhập thành công, bạn sẽ được chuyển về trang chủ hệ thống."
        ]
    },
    {
        icon: <Send className="w-6 h-6" />,
        title: "Gửi báo cáo mới:",
        color: "from-emerald-500 to-emerald-600",
        items: [
            "Chọn mục <b>Gửi báo cáo</b> trên thanh điều hướng hoặc nút tương ứng trên trang chủ.",
            "Điền đầy đủ các trường thông tin: Họ tên, Email, Khu vực xảy ra vụ việc, Loại tội phạm, Mô tả chi tiết.",
            "Đính kèm hình ảnh hoặc video minh chứng (nếu có) bằng cách kéo thả hoặc chọn file từ máy tính.",
            "Nếu muốn bảo mật danh tính, hãy tick vào ô <b>Gửi ẩn danh</b>.",
            "Kiểm tra lại thông tin, sau đó nhấn nút <b>Gửi báo cáo</b>.",
            "Chờ thông báo xác nhận gửi thành công hiện lên màn hình."
        ]
    },
    {
        icon: <FileText className="w-6 h-6" />,
        title: "Xem danh sách và chi tiết báo cáo đã gửi:",
        color: "from-purple-500 to-purple-600",
        items: [
            "Chọn mục <b>Lịch sử báo cáo</b> trên thanh điều hướng.",
            "Xem danh sách các báo cáo bạn đã gửi, kèm trạng thái xử lý (Đang xác minh, Đã duyệt, Đã xử lý).",
            "Nhấn vào nút <b>Xem chi tiết</b> để xem đầy đủ thông tin từng báo cáo, bao gồm phản hồi từ cơ quan chức năng (nếu có)."
        ]
    },
    {
        icon: <Trophy className="w-6 h-6" />,
        title: "Xem bảng xếp hạng người báo cáo tích cực:",
        color: "from-amber-500 to-amber-600",
        items: [
            "Chọn mục <b>Xếp hạng</b> trên thanh điều hướng.",
            "Xem bảng xếp hạng những người gửi báo cáo tích cực nhất, số lượng báo cáo hợp lệ, điểm uy tín và huy hiệu khen thưởng.",
            "Có thể tìm kiếm nhanh tên người dùng trong bảng xếp hạng."
        ]
    },
    {
        icon: <Search className="w-6 h-6" />,
        title: "Tìm kiếm & tra cứu đối tượng truy nã:",
        color: "from-rose-500 to-rose-600",
        items: [
            "Sử dụng thanh tìm kiếm ở đầu trang để nhập tên đối tượng hoặc thông tin liên quan.",
            "Kết quả sẽ hiển thị danh sách các đối tượng phù hợp với từ khóa tìm kiếm.",
            "Có thể chuyển trang để xem thêm kết quả nếu danh sách dài."
        ]
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Bảo mật & lưu ý:",
        color: "from-slate-500 to-slate-600",
        items: [
            "Mọi thông tin cá nhân và nội dung báo cáo đều được bảo mật theo chính sách của hệ thống.",
            "Chỉ cung cấp thông tin chính xác, trung thực. Báo cáo sai sự thật có thể bị xử lý theo quy định pháp luật.",
            "Liên hệ bộ phận hỗ trợ nếu gặp khó khăn khi sử dụng hệ thống."
        ]
    }
];

export default function UserManual() {
    return (
        <SidebarProvider>
            <SidebarInset>
                {/* === HƯỚNG DẪN SỬ DỤNG === */}
                <div className="min-h-screen p-4 md:p-6">
                    <div className="max-w-7xl mx-auto p-0 md:p-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-2xl p-6 md:p-8 mb-6 md:mb-8 text-white">
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                                    <Clock className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl md:text-3xl font-bold">Hướng dẫn sử dụng</h1>
                                    <p className="text-blue-100 text-base md:text-lg">Hệ thống cảnh báo tội phạm</p>
                                </div>
                            </div>
                            <p className="text-white/90 mt-4 text-sm md:text-base text-center sm:text-left">
                                Làm theo các bước dưới đây để sử dụng hệ thống một cách hiệu quả và an toàn
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full"
                                >
                                    <div className="flex flex-col gap-4 p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                <div className={`bg-gradient-to-br ${step.color} text-white rounded-xl p-4 shadow-lg`}>
                                                    {step.icon}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`bg-gradient-to-br ${step.color} text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center shadow-md`}>
                                                    {index + 1}
                                                </span>
                                                <h2
                                                    className="text-lg md:text-xl font-bold text-gray-800"
                                                    dangerouslySetInnerHTML={{ __html: step.title }}
                                                />
                                            </div>
                                        </div>
                                        <ul className="space-y-3">
                                            {step.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 mt-2"></span>
                                                    <span
                                                        className="leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: item }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Warning Notice */}
                        <div className="mt-6 md:mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-4 md:p-6 shadow-lg">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="bg-amber-100 rounded-full p-3">
                                        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-amber-200 text-amber-800 font-bold text-xs md:text-sm px-3 py-1 rounded-full">
                                            Lưu ý
                                        </span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                        Vui lòng đọc kỹ hướng dẫn trước khi sử dụng. Mọi hành vi lợi dụng hệ thống để báo cáo sai sự thật đều bị nghiêm cấm.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 md:mt-8 text-center text-gray-500 text-xs md:text-sm">
                            <p>© 2024 Hệ thống cảnh báo tội phạm - Phiên bản 1.0</p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}