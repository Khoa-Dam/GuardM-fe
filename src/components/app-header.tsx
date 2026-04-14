'use client';

import { useState } from 'react';
import { LogOut, User, Menu, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { userService } from '@/service/user.service';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './notification-bell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useSidebarState } from './sidebar-context';
import { Logo } from './icons';
import ThemeToggler from './theme/toggler';
import { ProfileSheet } from './profile-sheet';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function AppHeader() {
    const { userName, userRole, userAvatar, isGoogleUser, isAuthenticated, isLoading } = useUser();
    const router = useRouter();
    const { toggle } = useSidebarState();
    const [profileOpen, setProfileOpen] = useState(false);

    // Fetch live profile (stays fresh after update)
    const { data: profile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: () => userService.getMe(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    const displayName = profile?.name || userName;
    const displayAvatar = profile?.avatar || userAvatar;

    const handleLogout = async () => {
        await signOut({ redirect: false, callbackUrl: '/login' });
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-[200] flex items-center justify-between w-full border-b bg-background px-4 md:px-6 py-1 shadow-sm">
            {/* Left side */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggle}
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-500/30">
                        <Logo className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        <span className="text-red-600">Guard</span>M
                    </h2>
                </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* <ThemeToggler className="border-dashed size-10 md:size-14" /> */}
                {isAuthenticated && <NotificationBell />}

                {isAuthenticated ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-0"
                                    aria-label="User menu"
                                >
                                    <Avatar className="h-9 w-9 border border-gray-200 transition hover:ring-2 hover:ring-red-100">
                                        {displayAvatar ? (
                                            <AvatarImage src={displayAvatar} alt={displayName} />
                                        ) : null}
                                        <AvatarFallback className="bg-red-50 text-red-600 font-semibold text-sm">
                                            {displayName
                                                ? getInitials(displayName)
                                                : <User className="h-4 w-4 text-gray-500" />}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            {displayAvatar ? (
                                                <AvatarImage src={displayAvatar} alt={displayName} />
                                            ) : null}
                                            <AvatarFallback className="bg-red-50 text-red-600 font-semibold text-xs">
                                                {displayName ? getInitials(displayName) : <User className="h-3 w-3" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground mt-1 truncate">{userRole}</p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setProfileOpen(true)}
                                    className="cursor-pointer"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Chỉnh sửa hồ sơ</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ProfileSheet
                            open={profileOpen}
                            onOpenChange={setProfileOpen}
                            profile={profile ?? null}
                            isGoogleUser={isGoogleUser}
                        />
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm"
                            onClick={() => router.push('/login')}
                            disabled={isLoading}
                        >
                            Đăng nhập
                        </Button>
                        <Button
                            size="sm"
                            className="text-sm hidden sm:inline-flex bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => router.push('/signup')}
                            disabled={isLoading}
                        >
                            Đăng ký
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
