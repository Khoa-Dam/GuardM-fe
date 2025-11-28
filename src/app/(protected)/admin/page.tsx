'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldX, FileText, Database, CloudSun } from 'lucide-react';
import Link from 'next/link';

const adminSections = [
    {
        title: 'Quản lý người dùng',
        description: 'Tạo, sửa, xóa tài khoản người dùng',
        href: '/admin/users',
        icon: Users,
        color: 'text-blue-500',
    },
    {
        title: 'Đối tượng truy nã',
        description: 'Quản lý danh sách truy nã',
        href: '/admin/wanted',
        icon: ShieldX,
        color: 'text-red-500',
    },
    {
        title: 'Xác minh báo cáo',
        description: 'Xác minh báo cáo tội phạm',
        href: '/admin/reports',
        icon: FileText,
        color: 'text-green-500',
    },
    {
        title: 'Quản lý Scraper',
        description: 'Kích hoạt và theo dõi scrapers',
        href: '/admin/scraper',
        icon: Database,
        color: 'text-purple-500',
    },
    {
        title: 'Tin tức thời tiết',
        description: 'Quản lý tin tức và cảnh báo',
        href: '/admin/weather',
        icon: CloudSun,
        color: 'text-orange-500',
    },
];

export default function AdminDashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Quản lý hệ thống GuardM</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {adminSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link key={section.href} href={section.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{section.title}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{section.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Hướng dẫn sử dụng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Quản lý người dùng:</strong> Tạo, chỉnh sửa, xóa tài khoản và phân quyền</p>
                    <p>• <strong>Đối tượng truy nã:</strong> Thêm, cập nhật thông tin đối tượng truy nã</p>
                    <p>• <strong>Xác minh báo cáo:</strong> Xác minh các báo cáo tội phạm từ người dùng</p>
                    <p>• <strong>Quản lý Scraper:</strong> Kích hoạt scraper để cập nhật dữ liệu tự động</p>
                </CardContent>
            </Card>
        </div>
    );
}
