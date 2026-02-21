import { Metadata } from "next"
import { notFound } from "next/navigation"
import { InvoiceDetailContainer } from "@/components/invoice/invoice-detail-container"
import { DUMMY_INVOICES } from "@/lib/dummy-data"

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params
  // TODO: Phase 3에서 노션 API로 실제 견적서 번호 조회
  const invoice = DUMMY_INVOICES.find((inv) => inv.id === id)

  return {
    title: invoice
      ? `${invoice.invoiceNumber} | 견적서 관리`
      : `견적서 상세 | 견적서 관리`,
    description: "견적서 상세 정보 조회",
  }
}

/**
 * 견적서 상세 페이지 (F001, F002, F004)
 * - 더미 데이터에서 ID로 견적서 조회
 * - 클라이언트 컨테이너에 데이터 전달
 * - Phase 3에서 노션 API 연동으로 교체
 */
export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params

  // TODO: Phase 3에서 노션 API 연동으로 교체
  const invoice = DUMMY_INVOICES.find((inv) => inv.id === id)

  // 견적서를 찾을 수 없으면 404 처리
  if (!invoice) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <InvoiceDetailContainer invoice={invoice} />
    </div>
  )
}
