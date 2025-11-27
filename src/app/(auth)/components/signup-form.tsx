"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import authService from "@/service/auth.service"
import { signUp } from "@/utils/validation"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/icons"

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect')
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        // Prevent double submission
        if (isLoading) {
            return
        }

        // Validate using zod schema
        const result = signUp.safeParse({
            name: name.trim(),
            email: email.trim(),
            password,
            confirmPassword,
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

            // Show first error as general error
            if (result.error.issues.length > 0) {
                setError(result.error.issues[0].message)
            }
            return
        }

        setIsLoading(true)

        try {
            await authService.signup({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            })

            // Tự động đăng nhập sau khi đăng ký thành công
            const loginResult = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password: password,
                redirect: false,
            })

            if (loginResult?.error) {
                // Nếu đăng nhập thất bại, redirect đến login page
                toast.error('Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập thủ công.')
                router.push('/login')
                router.refresh()
            } else if (loginResult?.ok) {
                // Đăng nhập thành công, redirect đến trang ban đầu hoặc trang chủ
                toast.success('Đăng ký thành công!', {
                    description: 'Đang chuyển hướng...',
                    duration: 2000,
                })

                // Small delay to show success message before redirect
                await new Promise(resolve => setTimeout(resolve, 800))

                const redirectTo = redirectPath || "/dashboard"
                router.push(redirectTo)
                router.refresh()
            }
        } catch (err: any) {
            console.error('[Signup] Error:', err)
            console.error('[Signup] Error response:', err?.response?.data)
            console.error('[Signup] Error message:', err?.message)

            // Error đã được format trong authService
            const errorMessage = err?.message ||
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data ||
                'Đăng ký thất bại. Vui lòng thử lại.'

            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {/* Logo với link về trang chủ */}
            <Link
                href="/dashboard"
                aria-label="Về trang chủ"
                className="flex sm:hidden  gap-2 rounded-md hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-500/30">
                    <Logo className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    <span className="text-red-600">GuardM</span>
                </h2>
            </Link>

            <Card className="border-dashed border-gray-300">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Đăng ký</CardTitle>
                    <CardDescription>Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        required
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value)
                                            if (fieldErrors.name) {
                                                setFieldErrors({ ...fieldErrors, name: '' })
                                            }
                                        }}
                                        disabled={isLoading}
                                        className={fieldErrors.name ? "border-red-500" : ""}
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-sm text-red-600">{fieldErrors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            if (fieldErrors.email) {
                                                setFieldErrors({ ...fieldErrors, email: '' })
                                            }
                                        }}
                                        disabled={isLoading}
                                        className={fieldErrors.email ? "border-red-500" : ""}
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-sm text-red-600">{fieldErrors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="mật khẩu"
                                        required
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            if (fieldErrors.password) {
                                                setFieldErrors({ ...fieldErrors, password: '' })
                                            }
                                        }}
                                        disabled={isLoading}
                                        className={fieldErrors.password ? "border-red-500" : ""}
                                    />
                                    {fieldErrors.password && (
                                        <p className="text-sm text-red-600">{fieldErrors.password}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                            if (fieldErrors.confirmPassword) {
                                                setFieldErrors({ ...fieldErrors, confirmPassword: '' })
                                            }
                                        }}
                                        disabled={isLoading}
                                        className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang đăng ký...
                                        </>
                                    ) : (
                                        "Đăng ký"
                                    )}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Đã có tài khoản?{" "}
                                <a href="/login" className="underline underline-offset-4">
                                    Đăng nhập
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </div>
        </div>
    )
}

