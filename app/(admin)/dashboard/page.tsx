import { Metadata } from "next"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table"
import { DUMMY_INVOICES } from "@/lib/dummy-data"

export const metadata: Metadata = {
  title: "대시보드 | 견적서 관리",
  description: "견적서 현황 및 최근 목록",
}

/**
 * 관리자 대시보드 페이지 (F001)
 * - 전체 견적서 현황 통계 카드
 * - 최근 견적서 5건 테이블
 * - 더미 데이터 기반 렌더링 (Phase 3에서 실제 노션 연동)
 */
export default function DashboardPage() {
  // TODO: Phase 3에서 노션 API 연동으로 교체
  const invoices = DUMMY_INVOICES

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="mt-2 text-muted-foreground">
          견적서 전체 현황을 확인하세요
        </p>
      </div>

      {/* 통계 카드 영역 */}
      <div className="mb-8">
        <StatsCards invoices={invoices} />
      </div>

      {/* 최근 견적서 테이블 */}
      <RecentInvoicesTable invoices={invoices} />
    </div>
  )
}
