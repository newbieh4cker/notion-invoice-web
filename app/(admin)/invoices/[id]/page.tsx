import { Metadata } from "next"
import { notFound } from "next/navigation"
import { InvoiceDetailContainer } from "@/components/invoice/invoice-detail-container"
import { ErrorState } from "@/components/common/error-state"
import { getInvoiceById } from "@/lib/notion"

/**
 * 견적서 상세 페이지 캐시 설정
 * 30초 캐시: 사용자가 자주 접근하는 페이지이므로 짧은 캐시 활용
 */
export const revalidate = 30

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const invoice = await getInvoiceById(id)
    return {
      title: invoice
        ? `${invoice.invoiceNumber} | 견적서 관리`
        : "견적서 상세 | 견적서 관리",
      description: "견적서 상세 정보 조회",
    }
  } catch {
    return {
      title: "견적서 상세 | 견적서 관리",
      description: "견적서 상세 정보 조회",
    }
  }
}

/**
 * 견적서 상세 페이지 (F001, F002, F004)
 * - 노션 API에서 견적서 + 항목 조회
 * - 클라이언트 컨테이너에 데이터 전달
 */
export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params

  try {
    const invoice = await getInvoiceById(id)

    // 견적서를 찾을 수 없으면 404 처리
    if (!invoice) {
      notFound()
    }

    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <InvoiceDetailContainer invoice={invoice} />
      </div>
    )
  } catch (error) {
    // notFound() 에러는 그대로 전파
    if (error instanceof Error && error.message === "NEXT_NOT_FOUND") {
      throw error
    }
    console.error("견적서 상세 로딩 실패:", error)
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <ErrorState
          title="견적서를 불러올 수 없습니다"
          description="노션 API 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        />
      </div>
    )
  }
}
