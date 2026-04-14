"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import authService from "@/service/auth.service"
import { signUp } from "@/utils/validation"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { Loader2, AlertCircle, Lock, Mail, User } from "lucide-react"
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
    const [focused, setFocused] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        if (isLoading) return

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

            const loginResult = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            })

            if (loginResult?.error) {
                toast.error('Registration successful but sign in failed. Please sign in manually.')
                router.push('/login')
                router.refresh()
            } else if (loginResult?.ok) {
                toast.success('Registration successful!', { description: 'Redirecting...', duration: 2000 })
                await new Promise(resolve => setTimeout(resolve, 800))
                router.push(redirectPath || "/dashboard")
                router.refresh()
            }
        } catch (err: unknown) {
            const errorMessage = (err as Error)?.message || 'Registration failed. Please try again.'
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
        } finally {
            setIsLoading(false)
        }
    }

    const fields = [
        { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', value: name, onChange: setName, icon: User },
        { id: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com', value: email, onChange: setEmail, icon: Mail },
        { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', value: password, onChange: setPassword, icon: Lock },
        { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', value: confirmPassword, onChange: setConfirmPassword, icon: Lock },
    ]

    return (
        <div className={cn("flex flex-col gap-7", className)} {...props}>

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
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00d4ff]/30" />
                    <span className="font-mono text-[9px] tracking-[0.4em] text-[#00d4ff]/70 uppercase">
                        NEW OPERATOR
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00d4ff]/30" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-[#e8edf2] tracking-wide">
                    CREATE ACCOUNT
                </h1>
                <p className="font-mono text-[11px] text-[#6b7a8d] leading-relaxed">
                    Register to access the crime surveillance network
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 rounded border border-[#ff3b3b]/30 bg-[#ff3b3b]/6 px-3.5 py-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff3b3b]/60" />
                        <AlertCircle className="h-3.5 w-3.5 text-[#ff3b3b] mt-0.5 shrink-0" />
                        <p className="font-mono text-[11px] text-[#ff3b3b] leading-relaxed">{error}</p>
                    </div>
                )}

                {fields.map(({ id, label, type, placeholder, value, onChange, icon: Icon }) => (
                    <div key={id} className="space-y-1.5">
                        <Label htmlFor={id} className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#6b7a8d] flex items-center gap-1.5">
                            <Icon className="w-2.5 h-2.5" />
                            {label}
                        </Label>
                        <div className={cn(
                            "relative border rounded transition-all duration-200",
                            focused === id ? "border-[#00d4ff]/40 bg-[#00d4ff]/[0.03]" : "border-white/8 bg-transparent",
                            fieldErrors[id] ? "border-[#ff3b3b]/50" : ""
                        )}>
                            <Input
                                id={id}
                                type={type}
                                placeholder={placeholder}
                                required
                                value={value}
                                onChange={(e) => {
                                    onChange(e.target.value)
                                    if (fieldErrors[id]) setFieldErrors({ ...fieldErrors, [id]: '' })
                                }}
                                onFocus={() => setFocused(id)}
                                onBlur={() => setFocused(null)}
                                disabled={isLoading}
                                className="border-0 bg-transparent font-mono text-sm text-[#e8edf2] placeholder:text-[#6b7a8d]/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3"
                            />
                            {focused === id && (
                                <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />
                            )}
                        </div>
                        {fieldErrors[id] && (
                            <p className="font-mono text-[10px] text-[#ff3b3b] flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" />{fieldErrors[id]}
                            </p>
                        )}
                    </div>
                ))}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "relative w-full mt-2 h-11 rounded overflow-hidden font-heading text-[11px] tracking-[0.3em] uppercase transition-all duration-200",
                        "border border-[#00d4ff]/40 text-[#00d4ff]",
                        "hover:border-[#00d4ff]/70 hover:text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "group"
                    )}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/8 to-[#00d4ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute inset-0 bg-[#00d4ff]/5" />
                    <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                CREATING ACCOUNT...
                            </>
                        ) : (
                            "CREATE ACCOUNT →"
                        )}
                    </span>
                </button>

            </form>

            {/* Footer */}
            <div className="space-y-3">
                <p className="text-center font-mono text-[11px] text-[#6b7a8d]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#e8edf2] hover:text-[#ff3b3b] transition-colors font-bold">
                        Sign in →
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
