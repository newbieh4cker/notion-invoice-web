"use client"

/**
 * 견적서 상세 페이지 클라이언트 컨테이너
 * PDF 다운로드 훅 연동 및 전체 레이아웃 관리
 */

import { InvoiceHeader } from "@/components/invoice/invoice-header"
import { ClientInfo } from "@/components/invoice/client-info"
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table"
import { InvoiceSummary } from "@/components/invoice/invoice-summary"
import { InvoiceActions } from "@/components/invoice/invoice-actions"
import { Separator } from "@/components/ui/separator"
import { usePdfDownload } from "@/hooks/use-pdf-download"
import type { Invoice } from "@/types/invoice"

interface InvoiceDetailContainerProps {
  /** 견적서 데이터 */
  invoice: Invoice
}

/** PDF 출력 영역 DOM ID */
const PDF_ELEMENT_ID = "invoice-print-area"

export function InvoiceDetailContainer({ invoice }: InvoiceDetailContainerProps) {
  // PDF 파일명 생성
  const pdfFilename = `견적서_${invoice.invoiceNumber}_${invoice.clientName}.pdf`
  const { isGenerating, downloadPdf } = usePdfDownload({ filename: pdfFilename })

  // PDF 다운로드 핸들러
  const handleDownloadPdf = async () => {
    // TODO: 에러 처리 (toast 알림) 추가
    await downloadPdf(PDF_ELEMENT_ID)
  }

  return (
    <div className="space-y-6">
      {/* 견적서 헤더 (뒤로 가기, 번호, 날짜, 상태) */}
      <InvoiceHeader invoice={invoice} />

      <Separator />

      {/* PDF 출력 영역 시작 */}
      <div id={PDF_ELEMENT_ID} className="space-y-6 print:p-8">
        {/* 클라이언트 정보 카드 */}
        <ClientInfo invoice={invoice} />

        {/* 견적 항목 테이블 */}
        <InvoiceItemsTable items={invoice.items} />

        {/* 금액 요약 */}
        <InvoiceSummary invoice={invoice} />
      </div>

      <Separator />

      {/* 액션 버튼 바 */}
      <InvoiceActions
        invoice={invoice}
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGenerating}
      />
    </div>
  )
}
