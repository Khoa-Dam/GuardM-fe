import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/blur-fade"

export default function NotFound() {
    return (
        <div className="container flex min-h-screen flex-col items-center justify-center px-4 py-10">
            <div className="flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
                {/* Illustration */}
                <BlurFade delay={0.25} inView>
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
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Trang không tồn tại
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild>
                            <Link href="/">Về trang chủ</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/login">Đăng nhập</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

