import { Metadata } from "next"
import { Suspense } from "react"
import { InvoiceListContainer } from "@/components/invoice/invoice-list-container"
import { InvoicesPagination } from "@/components/invoice/invoices-pagination"
import { ErrorState } from "@/components/common/error-state"
import { getInvoices } from "@/lib/notion"

/**
 * 견적서 목록 페이지 캐시 설정
 * 60초 캐시: 목록은 실시간성 낮으므로 짧은 캐시 활용
 */
export const revalidate = 60

export const metadata: Metadata = {
  title: "견적서 목록 | 견적서 관리",
  description: "전체 견적서 목록 조회",
}

interface InvoicesPageProps {
  searchParams: Promise<{
    page?: string
    cursor?: string
    status?: string
  }>
}

/**
 * 견적서 목록 페이지 (F001)
 * - 노션 API에서 페이지당 20건씩 cursor 기반 페이지네이션 조회
 * - 클라이언트 컨테이너에 데이터 전달 (필터/검색/정렬은 클라이언트에서 처리)
 * - 이전/다음 페이지 네비게이션 지원
 */
export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { page: pageParam, cursor, status } = await searchParams

  // 현재 페이지 번호 (기본값: 1)
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10))

  try {
    // cursor 기반 페이지네이션으로 견적서 조회 (20건씩)
    const { invoices, nextCursor, hasMore } = await getInvoices(
      status ? { status } : undefined,
      20,
      cursor
    )

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

        {/* 페이지네이션 - Suspense로 감싸 클라이언트 렌더링 시 hydration 오류 방지 */}
        <Suspense fallback={null}>
          <InvoicesPagination
            currentPage={currentPage}
            hasMore={hasMore}
            nextCursor={nextCursor}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("견적서 목록 로딩 실패:", error)
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">견적서 목록</h1>
        </div>
        <ErrorState
          title="견적서를 불러올 수 없습니다"
          description="노션 API 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        />
      </div>
    )
  }
}
