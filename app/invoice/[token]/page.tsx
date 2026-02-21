import { Metadata } from "next"
import { InvoiceView } from "@/components/invoice/invoice-view"
import { ErrorState } from "@/components/common/error-state"
import { DUMMY_INVOICES } from "@/lib/dummy-data"
import { findTokenByValue } from "@/lib/dummy-tokens"

interface ClientInvoicePageProps {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: "견적서 열람",
  description: "공유받은 견적서를 확인하세요",
}

/**
 * 클라이언트 견적서 열람 페이지 (F003, F004, F011)
 * - 공유 토큰 유효성 검증 (더미 로직, Phase 3에서 실제 구현)
 * - 토큰이 유효하면 InvoiceView 렌더링
 * - 토큰이 유효하지 않으면 ErrorState 표시
 */
export default async function ClientInvoicePage({
  params,
}: ClientInvoicePageProps) {
  const { token } = await params

  // TODO: Phase 3에서 실제 토큰 검증 로직으로 교체 (lib/token.ts 활용)
  const tokenData = findTokenByValue(token)

  // 토큰이 없는 경우
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title="유효하지 않은 링크"
            description="요청하신 견적서 링크가 올바르지 않습니다. 발송된 링크를 다시 확인해주세요."
          />
        </div>
      </div>
    )
  }

  // 토큰이 만료된 경우
  if (new Date(tokenData.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title="만료된 링크"
            description="이 견적서 링크의 유효기간이 만료되었습니다. 새 링크를 요청해주세요."
          />
        </div>
      </div>
    )
  }

  // 토큰이 폐기된 경우
  if (tokenData.isRevoked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title="비활성화된 링크"
            description="이 견적서 링크가 비활성화되었습니다. 발신자에게 문의해주세요."
          />
        </div>
      </div>
    )
  }

  // 견적서 조회
  const invoice = DUMMY_INVOICES.find((inv) => inv.id === tokenData.invoiceId)

  // 견적서를 찾을 수 없는 경우
  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title="견적서를 찾을 수 없습니다"
            description="요청하신 견적서 정보를 찾을 수 없습니다. 발신자에게 문의해주세요."
          />
        </div>
      </div>
    )
  }

  // TODO: Phase 3에서 마지막 접근일 업데이트 구현

  return (
    <div className="min-h-screen bg-background">
      {/* 인쇄 친화적 레이아웃 */}
      <div className="container mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0">
        {/* 클라이언트 안내 헤더 (인쇄 시 숨김) */}
        <div className="mb-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground print:hidden">
          <p>
            이 견적서는 <strong className="text-foreground">{tokenData.clientEmail}</strong>
            님께 발송된 견적서입니다.
            PDF 다운로드 버튼을 이용해 저장할 수 있습니다.
          </p>
        </div>

        {/* 견적서 뷰 컴포넌트 */}
        <InvoiceView invoice={invoice} />
      </div>
    </div>
  )
}
