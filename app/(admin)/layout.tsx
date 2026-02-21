import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/session"

/**
 * 관리자 전용 레이아웃
 * 세션 검증 후 Navbar와 Footer가 포함된 레이아웃 렌더링
 * 미들웨어와 이중 검증으로 보안 강화
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 세션 유효성 확인 (미들웨어와 이중 검증)
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
