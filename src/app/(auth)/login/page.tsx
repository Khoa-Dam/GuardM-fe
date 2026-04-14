import { Suspense } from "react"
import { LoginForm } from "../components/login-form"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center gap-2 text-[#00d4ff]/50 font-mono text-xs tracking-widest">
                <Spinner className="h-4 w-4" /> LOADING...
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
