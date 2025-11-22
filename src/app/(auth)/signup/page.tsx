import { BlurFade } from "@/components/blur-fade"
import { SignupForm } from "../components/signup-form"

export default function SignupPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-900 gap-6 p-6 md:p-10">
            <BlurFade delay={0.25} inView>
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <SignupForm />
                </div>
            </BlurFade>
        </div>
    )
}

