import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SharesContainer } from "@/components/share/shares-container"
import { ErrorState } from "@/components/common/error-state"
import { getInvoiceById, getAccessTokensByInvoiceId } from "@/lib/notion"

interface SharesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: SharesPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const invoice = await getInvoiceById(id)
    return {
      title: invoice
        ? `공유 링크 관리 - ${invoice.invoiceNumber} | 견적서 관리`
        : "공유 링크 관리 | 견적서 관리",
      description: "견적서 공유 링크 생성 및 관리",
    }
  } catch {
    return {
      title: "공유 링크 관리 | 견적서 관리",
      description: "견적서 공유 링크 생성 및 관리",
    }
  }
}

/**
 * 공유 링크 관리 페이지 (F002, F011)
 * - 노션 API에서 견적서 + 토큰 목록 조회
 * - 클라이언트 컨테이너에 데이터 전달
 */
export default async function SharesPage({ params }: SharesPageProps) {
  const { id } = await params

  try {
    const invoice = await getInvoiceById(id)

    if (!invoice) {
      notFound()
    }

    // 해당 견적서의 모든 토큰 조회
    const tokens = await getAccessTokensByInvoiceId(id)

    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <SharesContainer
          invoiceId={id}
          invoiceNumber={invoice.invoiceNumber}
          initialTokens={tokens}
        />
      </div>
    )
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_NOT_FOUND") {
      throw error
    }
    console.error("공유 링크 페이지 로딩 실패:", error)
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <ErrorState
          title="공유 링크를 불러올 수 없습니다"
          description="노션 API 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        />
      </div>
    )
  }
}
