import { Metadata } from "next"

export const metadata: Metadata = {
  title: "견적서 목록 | 견적서 관리",
  description: "전체 견적서 목록 조회",
}

/**
 * 견적서 목록 페이지 (F001)
 * - 노션 DB에서 전체 견적서 목록 조회
 * - 상태별 필터링, 클라이언트명 검색, 정렬 기능
 */
export default function InvoicesPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">견적서 목록</h1>
          <p className="mt-2 text-muted-foreground">
            노션 DB와 연동된 전체 견적서 목록
          </p>
        </div>
      </div>
      {/* TODO: InvoiceFilters 컴포넌트 */}
      {/* TODO: InvoiceTable 컴포넌트 */}
      <p className="text-sm text-muted-foreground">견적서 목록 구현 예정</p>
    </div>
  )
}
