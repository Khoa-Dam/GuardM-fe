'use client';

import { LogOut, User, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

// Import các component từ Shadcn UI
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

export function AppHeader() {
    const { userName, userRole, isAuthenticated, isLoading } = useUser();
    const router = useRouter();
    const { toggle } = useSidebarState();

    const handleLogout = async () => {
        await signOut({
            redirect: false,
            callbackUrl: '/login',
        });
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between w-full border-b bg-background px-4 md:px-6 py-3 shadow-sm">
            {/* Left side: Hamburger + Branding */}
            <div className="flex items-center gap-2">
                {/* Hamburger menu cho mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggle}
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

            {/* Actions bên phải */}

            <div className="flex items-center gap-3 md:gap-4">
      <ThemeToggler className="border-dashed size-10 md:size-14" />

                {isAuthenticated ? (
                    <>
                        {/* Nút Thông báo */}
                        {/* <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-amber-600">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                        </Button> */}

                        {/* User Dropdown */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-0"
                                >
                                    <Avatar className="h-9 w-9 border border-gray-200 transition hover:ring-2 hover:ring-red-100">
                                        {/* Fallback luôn hiện vì không có AvatarImage */}
                                        <AvatarFallback className="bg-gray-100">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{userName || 'Administrator'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{userRole || 'User'}</p>
                                    </div>
                                </DropdownMenuLabel>
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
                            className="text-sm  hidden sm:inline-flex bg-red-600 hover:bg-red-700 text-white"
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