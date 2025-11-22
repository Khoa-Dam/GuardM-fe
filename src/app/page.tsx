import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth-helpers"

export const metadata = {
  title: "Trang chủ",
  description: "Hệ thống tra cứu tội phạm truy nã toàn quốc",
}

export default async function HomePage() {
  const user = await getCurrentUser()

  // Nếu user đã đăng nhập, redirect đến dashboard
  if (user) {
    redirect("/dashboard")
  }

  // Nếu chưa đăng nhập, redirect đến trang dashboard public
  redirect("/login")
}
