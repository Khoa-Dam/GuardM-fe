import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/blur-fade"

export default function NotFound() {
    return (
        <div className="container flex min-h-screen flex-col  items-center justify-center bg-white px-4 py-10">
            <div className="flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
                {/* Illustration */}
                <BlurFade delay={0.25} inView >
                    <div className="flex-1 flex items-center justify-center">
                        <Image
                            priority
                            src="/illustrations/timed-out-error.svg"
                            alt="404 Not Found"
                            width={400}
                            height={400}
                            className="drop-shadow-xl"
                        />
                    </div>
                </BlurFade>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left">
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Page not found
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Sorry, the page you are looking for does not exist or has been moved.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="dark:text-white" asChild>
                            <Link href="/dashboard">Back to home</Link>
                        </Button>
                        <Button variant="outline" className="dark:text-black dark:border-black " asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

