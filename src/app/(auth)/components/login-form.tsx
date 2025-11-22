"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { email, password } from "@/utils/validation"
import { z } from "zod"
import { toast } from "sonner"

const loginSchema = z.object({
    email,
    password,
})

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect')
    const [emailValue, setEmailValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // Get route name for display
    const getRouteName = (path: string) => {
        const routeNames: Record<string, string> = {
            '/reports': 'Báo cáo tội phạm',
            '/map': 'Bản đồ cảnh báo',
            '/dashboard': 'Trang chủ',
        }
        return routeNames[path] || path
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        // Prevent double submission
        if (isLoading) {
            return
        }

        // Validate using zod schema
        const result = loginSchema.safeParse({
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

            // Show first error as general error
            if (result.error.issues.length > 0) {
                setError(result.error.issues[0].message)
            }
            return
        }

        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email: emailValue.trim(),
                password: passwordValue,
                redirect: false,
            })

            if (result?.error) {
                setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
            } else if (result?.ok) {
                // Redirect to the original path if exists, otherwise go to home
                const redirectTo = redirectPath || '/'
                router.push(redirectTo)
                router.refresh()
            }
        } catch (err: any) {
            setError(
                err?.message ||
                'Đăng nhập thất bại. Vui lòng thử lại.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (redirectPath) {
            toast.warning(`Bạn cần đăng nhập để truy cập trang`)
        }
    }, [redirectPath])

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-dashed border-gray-300">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome</CardTitle>
                    <CardDescription>Đăng nhập vào hệ thống để xem thông tin tội phạm và các cảnh báo gần bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            {/* <div className="flex flex-col gap-4">
                                <Button variant="outline" className="w-full" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Login with Google
                                </Button>
                            </div>
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div> */}
                            <div className="grid gap-6">


                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={emailValue}
                                        onChange={(e) => {
                                            setEmailValue(e.target.value)
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
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={passwordValue}
                                        onChange={(e) => {
                                            setPasswordValue(e.target.value)
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang đăng nhập..." : "Login"}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Chưa có tài khoản?{" "}
                                <a href="/signup" className="underline underline-offset-4">
                                    Đăng ký
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
