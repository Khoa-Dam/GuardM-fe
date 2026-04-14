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
import { Loader2, AlertCircle, Lock, Mail } from "lucide-react"
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
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

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
                setTimeout(() => reject(new Error('Timeout: Unable to connect to the server.')), 10000)
            })

            const signInPromise = signIn("credentials", {
                email: emailValue.trim(),
                password: passwordValue,
                redirect: false,
            })

            const res = await Promise.race([signInPromise, timeoutPromise]) as { error?: string; ok?: boolean }

            if (res?.error) {
                setError('Sign in failed. Please check your email and password.')
                toast.error('Sign in failed.')
            } else if (res?.ok) {
                toast.success('Signed in successfully!', { description: 'Redirecting...', duration: 2000 })
                await new Promise(resolve => setTimeout(resolve, 800))
                router.push(redirectPath || '/dashboard')
                router.refresh()
            } else {
                setError('Unable to connect to the server. Please try again.')
                toast.error('Unable to connect to the server.')
            }
        } catch (err: unknown) {
            const msg = (err as Error)?.message || 'An error occurred. Please try again.'
            setError(msg)
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (redirectPath) toast.warning('You need to sign in to access this page')
    }, [redirectPath])

    return (
        <div className={cn("flex flex-col gap-8", className)} {...props}>

            {/* Mobile logo */}
            <Link href="/" className="flex lg:hidden items-center gap-2.5 self-start group">
                <div className="p-1.5 rounded bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 group-hover:bg-[#ff3b3b]/20 transition-colors">
                    <Logo className="w-5 h-5 text-[#ff3b3b]" />
                </div>
                <span className="font-heading text-base font-bold tracking-tight text-[#e8edf2]">
                    GUARD<span className="text-[#ff3b3b]">[M]</span>
                </span>
            </Link>

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ff3b3b]/30" />
                    <span className="font-mono text-[9px] tracking-[0.4em] text-[#ff3b3b]/70 uppercase">
                        IDENTITY VERIFICATION
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ff3b3b]/30" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-[#e8edf2] tracking-wide">
                    ACCESS SYSTEM
                </h1>
                <p className="font-mono text-[11px] text-[#6b7a8d] leading-relaxed">
                    Authenticate to view crime data and receive proximity alerts
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 rounded border border-[#ff3b3b]/30 bg-[#ff3b3b]/6 px-3.5 py-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff3b3b]/60" />
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
                    className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#8899aa] hover:text-[#e8edf2] font-mono text-[11px] tracking-widest uppercase h-11 transition-all duration-200 rounded group"
                >
                    <svg viewBox="0 0 24 24" className="mr-2.5 h-3.5 w-3.5 shrink-0 group-hover:scale-110 transition-transform">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                    Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/6" />
                    <span className="font-mono text-[9px] tracking-[0.35em] text-[#6b7a8d]/60 uppercase">OR</span>
                    <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#6b7a8d] flex items-center gap-1.5">
                        <Mail className="w-2.5 h-2.5" />
                        Email
                    </Label>
                    <div className={cn(
                        "relative border rounded transition-all duration-200",
                        emailFocused ? "border-[#00d4ff]/40 bg-[#00d4ff]/[0.03]" : "border-white/8 bg-transparent",
                        fieldErrors.email ? "border-[#ff3b3b]/50" : ""
                    )}>
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
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            disabled={isLoading}
                            className="border-0 bg-transparent font-mono text-sm text-[#e8edf2] placeholder:text-[#6b7a8d]/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-3"
                        />
                        {emailFocused && (
                            <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />
                        )}
                    </div>
                    {fieldErrors.email && (
                        <p className="font-mono text-[10px] text-[#ff3b3b] flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />{fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#6b7a8d] flex items-center gap-1.5">
                        <Lock className="w-2.5 h-2.5" />
                        Password
                    </Label>
                    <div className={cn(
                        "relative border rounded transition-all duration-200",
                        passwordFocused ? "border-[#00d4ff]/40 bg-[#00d4ff]/[0.03]" : "border-white/8 bg-transparent",
                        fieldErrors.password ? "border-[#ff3b3b]/50" : ""
                    )}>
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
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            disabled={isLoading}
                            className="border-0 bg-transparent font-mono text-sm text-[#e8edf2] placeholder:text-[#6b7a8d]/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-3"
                        />
                        {passwordFocused && (
                            <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />
                        )}
                    </div>
                    {fieldErrors.password && (
                        <p className="font-mono text-[10px] text-[#ff3b3b] flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />{fieldErrors.password}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "relative w-full mt-1 h-11 rounded overflow-hidden font-heading text-[11px] tracking-[0.3em] uppercase transition-all duration-200",
                        "border border-[#ff3b3b]/50 text-[#ff3b3b]",
                        "hover:border-[#ff3b3b]/80 hover:text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "group"
                    )}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#ff3b3b]/0 via-[#ff3b3b]/10 to-[#ff3b3b]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute inset-0 bg-[#ff3b3b]/8" />
                    <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                AUTHENTICATING...
                            </>
                        ) : (
                            "AUTHENTICATE →"
                        )}
                    </span>
                </button>

            </form>

            {/* Footer */}
            <div className="space-y-3">
                <p className="text-center font-mono text-[11px] text-[#6b7a8d]">
                    No account?{" "}
                    <Link href="/signup" className="text-[#e8edf2] hover:text-[#ff3b3b] transition-colors font-bold">
                        Create one →
                    </Link>
                </p>
                <p className="text-center font-mono text-[9px] text-[#6b7a8d]/40 tracking-wide">
                    By continuing you agree to our{" "}
                    <Link href="/terms" className="underline underline-offset-2 hover:text-[#6b7a8d] transition-colors">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline underline-offset-2 hover:text-[#6b7a8d] transition-colors">Privacy</Link>
                </p>
            </div>

        </div>
    )
}
