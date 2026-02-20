import { Metadata } from "next"

interface ClientInvoicePageProps {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: "견적서 열람",
  description: "공유받은 견적서를 확인하세요",
}

/**
 * 클라이언트 견적서 열람 페이지 (F003, F004, F011)
 * - 공유 토큰 유효성 검증
 * - 견적서 전체 정보 표시 (로그인 불필요)
 * - PDF 다운로드
 * - 마지막 접근일 기록
 */
export default async function ClientInvoicePage({
  params,
}: ClientInvoicePageProps) {
  const { token } = await params

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* TODO: 토큰 검증 후 InvoiceView 렌더링 */}
        {/* TODO: PdfDownloadButton 컴포넌트 */}
        <p className="text-sm text-muted-foreground">
          토큰: {token} 검증 후 견적서 표시 예정
        </p>
      </div>
    </div>
  )
}
