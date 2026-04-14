'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Camera, Loader2, User, Mail, Shield, CheckCircle2 } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { userService, type User as UserProfile } from '@/service/user.service';
import { cn } from '@/lib/utils';

interface ProfileSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: UserProfile | null;
    isGoogleUser: boolean;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function ProfileSheet({ open, onOpenChange, profile, isGoogleUser }: ProfileSheetProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(profile?.name ?? '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open && profile) {
            setName(profile.name ?? '');
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    }, [open, profile]);

    const currentAvatar = avatarPreview ?? profile?.avatar ?? null;
    const hasChanges = name.trim() !== (profile?.name ?? '') || avatarFile !== null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Tên không được để trống');
            return;
        }
        setIsSaving(true);
        try {
            await userService.updateMe({ name: name.trim(), avatar: avatarFile ?? undefined });
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Cập nhật thành công');
            onOpenChange(false);
        } catch {
            // error toasted by service
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full max-w-sm p-0 flex flex-col overflow-hidden z-[300]"
            >
                <SheetTitle className="sr-only">Chỉnh sửa hồ sơ</SheetTitle>
                <SheetDescription className="sr-only">Cập nhật thông tin cá nhân và ảnh đại diện</SheetDescription>
                {/* Hero section */}
                <div className="relative bg-gradient-to-br from-red-500 to-red-700 px-6 pt-10 pb-16 flex flex-col items-center gap-3 shrink-0">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    {/* Avatar */}
                    <div className="relative z-10">
                        <div className="rounded-full p-1 bg-white/20 backdrop-blur-sm">
                            <Avatar className="h-24 w-24 border-2 border-white shadow-xl">
                                {currentAvatar && <AvatarImage src={currentAvatar} alt={name} />}
                                <AvatarFallback className="bg-red-200 text-red-700 text-2xl font-bold">
                                    {name ? getInitials(name) : <User className="h-9 w-9" />}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {!isGoogleUser && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0.5 right-0.5 rounded-full bg-white p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                aria-label="Đổi ảnh đại diện"
                            >
                                <Camera className="h-3.5 w-3.5 text-red-600" />
                            </button>
                        )}
                    </div>

                    {/* Name + role */}
                    <div className="z-10 text-center">
                        <p className="text-white font-semibold text-lg leading-tight">{profile?.name || '—'}</p>
                        <p className="text-red-100 text-sm mt-0.5">{profile?.email}</p>
                    </div>

                    {/* Google badge */}
                    {isGoogleUser && (
                        <div className="z-10 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            <span className="text-white text-xs font-medium">Tài khoản Google</span>
                        </div>
                    )}

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 overflow-y-auto -mt-6">
                    <div className="bg-background rounded-t-2xl flex flex-col gap-5 px-5 pt-5 pb-6 flex-1">

                        {/* Edit name */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="profile-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Tên hiển thị
                            </Label>
                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên của bạn"
                                className="h-10"
                            />
                        </div>

                        <Separator />

                        {/* Info rows */}
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin tài khoản</p>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium truncate">{profile?.email ?? '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                                <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                    <Shield className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground">Vai trò</p>
                                    <p className="text-sm font-medium">{profile?.role ?? '—'}</p>
                                </div>
                            </div>

                            {avatarFile && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-green-600">Ảnh mới đã chọn</p>
                                        <p className="text-sm font-medium text-green-700 truncate max-w-[180px]">{avatarFile.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions pushed to bottom */}
                        <div className="mt-auto pt-2 flex flex-col gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className={cn(
                                    "w-full h-10 font-semibold",
                                    hasChanges
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {isSaving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                ) : (
                                    'Lưu thay đổi'
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                                className="w-full h-10 text-muted-foreground"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
