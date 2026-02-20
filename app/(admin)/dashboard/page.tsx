import { Metadata } from "next"

export const metadata: Metadata = {
  title: "대시보드 | 견적서 관리",
  description: "견적서 현황 및 최근 목록",
}

/**
 * 관리자 대시보드 페이지 (F001)
 * - 전체 견적서 현황 및 최근 목록 표시
 */
export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="mt-2 text-muted-foreground">
          견적서 전체 현황을 확인하세요
        </p>
      </div>
      {/* TODO: DashboardStats 컴포넌트 */}
      {/* TODO: RecentInvoicesTable 컴포넌트 */}
      <p className="text-sm text-muted-foreground">대시보드 구현 예정</p>
    </div>
  )
}
