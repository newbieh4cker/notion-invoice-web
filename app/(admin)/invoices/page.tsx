import { Metadata } from "next"
import { InvoiceListContainer } from "@/components/invoice/invoice-list-container"
import { ErrorState } from "@/components/common/error-state"
import { getInvoices } from "@/lib/notion"

export const metadata: Metadata = {
  title: "견적서 목록 | 견적서 관리",
  description: "전체 견적서 목록 조회",
}

/**
 * 견적서 목록 페이지 (F001)
 * - 노션 API에서 전체 견적서 조회
 * - 클라이언트 컨테이너에 데이터 전달 (필터/검색/정렬은 클라이언트에서 처리)
 */
export default async function InvoicesPage() {
  try {
    const invoices = await getInvoices()

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
