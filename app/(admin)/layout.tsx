import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

/**
 * 관리자 전용 레이아웃
 * Navbar와 Footer가 포함된 레이아웃
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
