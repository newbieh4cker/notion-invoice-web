import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SharesContainer } from "@/components/share/shares-container"
import { DUMMY_INVOICES } from "@/lib/dummy-data"
import { DUMMY_TOKENS } from "@/lib/dummy-tokens"

interface SharesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: SharesPageProps): Promise<Metadata> {
  const { id } = await params
  const invoice = DUMMY_INVOICES.find((inv) => inv.id === id)

  return {
    title: invoice
      ? `공유 링크 관리 - ${invoice.invoiceNumber} | 견적서 관리`
      : "공유 링크 관리 | 견적서 관리",
    description: "견적서 공유 링크 생성 및 관리",
  }
}

/**
 * 공유 링크 관리 페이지 (F002, F011)
 * - 특정 견적서의 공유 토큰 목록 조회
 * - 새 토큰 생성 (클라이언트 이메일, 유효기간 설정)
 * - 토큰 복사 및 무효화
 * - Phase 3에서 노션 API 연동
 */
export default async function SharesPage({ params }: SharesPageProps) {
  const { id } = await params

  // TODO: Phase 3에서 노션 API 연동으로 교체
  const invoice = DUMMY_INVOICES.find((inv) => inv.id === id)

  if (!invoice) {
    notFound()
  }

  // 해당 견적서의 모든 토큰 조회
  const tokens = DUMMY_TOKENS.filter((tok) => tok.invoiceId === id)

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <SharesContainer
        invoiceId={id}
        invoiceNumber={invoice.invoiceNumber}
        initialTokens={tokens}
      />
    </div>
  )
}
