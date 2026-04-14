"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { login } from "@/utils/validation"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/icons"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect')
    const [emailValue, setEmailValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        if (isLoading) return

        const result = login.safeParse({
            type: 'email',
            email: emailValue.trim(),
            password: passwordValue,
        })

        if (!result.success) {
            const errors: Record<string, string> = {}
            result.error.issues.forEach((err) => {
                if (err.path.length > 0) {
                    const field = err.path[0] as string
                    errors[field] = err.message
                }
            })
            setFieldErrors(errors)
            if (result.error.issues.length > 0) {
                setError(result.error.issues[0].message)
            }
            return
        }

        setIsLoading(true)

        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: Không thể kết nối đến server.')), 10000)
            })

            const signInPromise = signIn("credentials", {
                email: emailValue.trim(),
                password: passwordValue,
                redirect: false,
            })

            const res = await Promise.race([signInPromise, timeoutPromise]) as { error?: string; ok?: boolean }

            if (res?.error) {
                setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
                toast.error('Đăng nhập thất bại.')
            } else if (res?.ok) {
                toast.success('Đăng nhập thành công!', { description: 'Đang chuyển hướng...', duration: 2000 })
                await new Promise(resolve => setTimeout(resolve, 800))
                router.push(redirectPath || '/dashboard')
                router.refresh()
            } else {
                setError('Không thể kết nối đến server. Vui lòng thử lại.')
                toast.error('Không thể kết nối đến server.')
            }
        } catch (err: unknown) {
            const msg = (err as Error)?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
            setError(msg)
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (redirectPath) toast.warning('Bạn cần đăng nhập để truy cập trang')
    }, [redirectPath])

    return (
        <div className={cn("flex flex-col gap-7", className)} {...props}>

            {/* Mobile logo */}
            <Link href="/" className="flex lg:hidden items-center gap-2.5 self-start group">
                <div className="p-1.5 rounded bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 group-hover:bg-[#ff3b3b]/20 transition-colors">
                    <Logo className="w-5 h-5 text-[#ff3b3b]" />
                </div>
                <span className="font-mono text-base font-bold tracking-tight text-[#e8edf2]">
                    GRD<span className="text-[#ff3b3b]">[M]</span>
                </span>
            </Link>

            {/* Header */}
            <div className="space-y-1">
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b] uppercase">
                    IDENTITY VERIFICATION
                </p>
                <h1 className="font-mono text-xl font-bold text-[#e8edf2] tracking-tight">
                    Đăng nhập
                </h1>
                <p className="text-xs text-[#6b7a8d] tracking-wide">
                    Xem thông tin tội phạm và nhận cảnh báo gần bạn
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 rounded bg-[#ff3b3b]/8 border border-[#ff3b3b]/25 px-3 py-2.5">
                        <AlertCircle className="h-3.5 w-3.5 text-[#ff3b3b] mt-0.5 shrink-0" />
                        <p className="font-mono text-[11px] text-[#ff3b3b] leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Google OAuth */}
                <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={() => signIn('google', { callbackUrl: redirectPath || '/dashboard' })}
                    className="w-full border-white/10 bg-transparent hover:bg-white/5 text-[#8899aa] hover:text-[#e8edf2] font-mono text-[11px] tracking-widest uppercase h-10 transition-colors"
                >
                    <svg viewBox="0 0 24 24" className="mr-2 h-3.5 w-3.5 shrink-0">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                    Đăng nhập với Google
                </Button>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/6" />
                    <span className="font-mono text-[9px] tracking-[0.3em] text-[#6b7a8d] uppercase">OR</span>
                    <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6b7a8d]">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={emailValue}
                        onChange={(e) => {
                            setEmailValue(e.target.value)
                            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                        }}
                        disabled={isLoading}
                        className={cn(
                            "bg-transparent border-0 border-b rounded-none font-mono text-sm text-[#e8edf2] placeholder:text-[#6b7a8d]/50",
                            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#ff3b3b] h-9 px-0",
                            "transition-colors",
                            fieldErrors.email ? "border-[#ff3b3b]/60" : "border-white/10"
                        )}
                    />
                    {fieldErrors.email && (
                        <p className="font-mono text-[10px] text-[#ff3b3b]">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6b7a8d]">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={passwordValue}
                        onChange={(e) => {
                            setPasswordValue(e.target.value)
                            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
                        }}
                        disabled={isLoading}
                        className={cn(
                            "bg-transparent border-0 border-b rounded-none font-mono text-sm text-[#e8edf2] placeholder:text-[#6b7a8d]/50",
                            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#ff3b3b] h-9 px-0",
                            "transition-colors",
                            fieldErrors.password ? "border-[#ff3b3b]/60" : "border-white/10"
                        )}
                    />
                    {fieldErrors.password && (
                        <p className="font-mono text-[10px] text-[#ff3b3b]">{fieldErrors.password}</p>
                    )}
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 bg-transparent border border-[#ff3b3b]/50 text-[#ff3b3b] hover:bg-[#ff3b3b]/10 hover:border-[#ff3b3b]/80 font-mono text-[11px] tracking-[0.2em] uppercase h-10 transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            AUTHENTICATING...
                        </>
                    ) : (
                        "AUTHENTICATE →"
                    )}
                </Button>

            </form>

            {/* Footer */}
            <div className="space-y-3">
                <p className="text-center font-mono text-[11px] text-[#6b7a8d]">
                    Chưa có tài khoản?{" "}
                    <Link href="/signup" className="text-[#e8edf2] hover:text-[#ff3b3b] transition-colors underline underline-offset-4">
                        Đăng ký
                    </Link>
                </p>
                <p className="text-center font-mono text-[9px] text-[#6b7a8d]/50 tracking-wide">
                    Tiếp tục đồng nghĩa với việc bạn chấp nhận{" "}
                    <Link href="/terms" className="underline underline-offset-2 hover:text-[#6b7a8d] transition-colors">Terms</Link>
                    {" "}và{" "}
                    <Link href="/privacy" className="underline underline-offset-2 hover:text-[#6b7a8d] transition-colors">Privacy</Link>
                </p>
            </div>

        </div>
    )
}
