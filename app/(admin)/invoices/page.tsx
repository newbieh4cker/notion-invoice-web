import { Metadata } from "next"
import { InvoiceListContainer } from "@/components/invoice/invoice-list-container"
import { DUMMY_INVOICES } from "@/lib/dummy-data"

export const metadata: Metadata = {
  title: "견적서 목록 | 견적서 관리",
  description: "전체 견적서 목록 조회",
}

/**
 * 견적서 목록 페이지 (F001)
 * - 더미 데이터 기반 견적서 목록 표시 (Phase 3에서 노션 연동)
 * - 상태별 필터링, 클라이언트명 검색, 정렬 기능
 */
export default function InvoicesPage() {
  // TODO: Phase 3에서 노션 API 연동으로 교체
  const invoices = DUMMY_INVOICES

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">견적서 목록</h1>
          <p className="mt-2 text-muted-foreground">
            노션 DB와 연동된 전체 견적서 목록
          </p>
        </div>
      </div>

      {/* 필터/검색/정렬/테이블 클라이언트 컨테이너 */}
      <InvoiceListContainer initialInvoices={invoices} />
    </div>
  )
}
