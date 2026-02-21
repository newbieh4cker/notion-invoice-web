import { Metadata } from "next"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table"
import { ErrorState } from "@/components/common/error-state"
import { getInvoices } from "@/lib/notion"

export const metadata: Metadata = {
  title: "대시보드 | 견적서 관리",
  description: "견적서 현황 및 최근 목록",
}

/**
 * 관리자 대시보드 페이지 (F001)
 * - 노션 API에서 전체 견적서 조회
 * - 통계 카드 및 최근 견적서 테이블 표시
 */
export default async function DashboardPage() {
  try {
    // 환경변수 확인 (디버그)
    console.log("=== 환경변수 확인 ===")
    console.log("NOTION_API_KEY:", process.env.NOTION_API_KEY ? "설정됨" : "미설정")
    console.log("NOTION_INVOICES_DB_ID:", process.env.NOTION_INVOICES_DB_ID)
    console.log("NOTION_INVOICE_ITEMS_DB_ID:", process.env.NOTION_INVOICE_ITEMS_DB_ID)
    console.log("NOTION_ACCESS_TOKENS_DB_ID:", process.env.NOTION_ACCESS_TOKENS_DB_ID)

    const invoices = await getInvoices()

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
  } catch (error) {
    // 상세 에러 로깅
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("대시보드 데이터 로딩 실패:", errorMessage)
    console.error("에러 전체:", error)

    return (
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        </div>
        <ErrorState
          title="데이터를 불러올 수 없습니다"
          description={`노션 API 연결에 문제가 발생했습니다. 에러: ${errorMessage}`}
        />
      </div>
    )
  }
}
