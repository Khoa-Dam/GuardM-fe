import { Suspense } from "react"
import { BlurFade } from "@/components/blur-fade"
import { LoginForm } from "../components/login-form"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-900 gap-6  p-6 md:p-10">
            <BlurFade delay={0.25} inView>
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Suspense fallback={<Spinner className="size-10 animate-spin" />}>
                        <LoginForm />
                    </Suspense>
                </div>
            </BlurFade>
        </div>
    )
}
