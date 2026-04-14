'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldX, FileText, Database, CloudSun } from 'lucide-react';
import Link from 'next/link';

const adminSections = [
    {
        title: 'User Management',
        description: 'Create, edit, delete user accounts',
        href: '/admin/users',
        icon: Users,
        color: 'text-blue-500',
    },
    {
        title: 'Wanted Criminals',
        description: 'Manage the wanted criminals list',
        href: '/admin/wanted',
        icon: ShieldX,
        color: 'text-red-500',
    },
    {
        title: 'Verify Reports',
        description: 'Verify crime reports',
        href: '/admin/reports',
        icon: FileText,
        color: 'text-green-500',
    },
    {
        title: 'Scraper Management',
        description: 'Trigger and monitor scrapers',
        href: '/admin/scraper',
        icon: Database,
        color: 'text-purple-500',
    },
    {
        title: 'Weather News',
        description: 'Manage news and alerts',
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
                <p className="text-muted-foreground">Manage the GuardM system</p>
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
                    <CardTitle>Usage Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>User Management:</strong> Create, edit, delete accounts and assign roles</p>
                    <p>• <strong>Wanted Criminals:</strong> Add, update wanted criminal information</p>
                    <p>• <strong>Verify Reports:</strong> Verify crime reports submitted by users</p>
                    <p>• <strong>Scraper Management:</strong> Trigger scrapers to automatically update data</p>
                </CardContent>
            </Card>
        </div>
    );
}
