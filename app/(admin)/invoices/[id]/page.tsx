import { Metadata } from "next"

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `견적서 상세 (${id}) | 견적서 관리`,
    description: "견적서 상세 정보 조회",
  }
}

/**
 * 견적서 상세 페이지 (F001, F002, F004)
 * - 노션 페이지 ID 기반 견적서 상세 정보 조회
 * - 공유 링크 생성 모달
 * - PDF 다운로드
 */
export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">견적서 상세</h1>
        <p className="mt-2 text-muted-foreground">견적서 ID: {id}</p>
      </div>
      {/* TODO: InvoiceDetail 컴포넌트 */}
      {/* TODO: ShareLinkModal 컴포넌트 */}
      {/* TODO: PdfDownloadButton 컴포넌트 */}
      <p className="text-sm text-muted-foreground">견적서 상세 구현 예정</p>
    </div>
  )
}
