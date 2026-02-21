"use client"

/**
 * 견적서 상세 액션 버튼 바 컴포넌트 (관리자용)
 * 공유 링크 생성, PDF 다운로드, 뒤로 가기 버튼 표시
 */

import { useRouter } from "next/navigation"
import { Share2, Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Invoice } from "@/types/invoice"

interface InvoiceActionsProps {
  /** 견적서 데이터 */
  invoice: Invoice
  /** PDF 다운로드 핸들러 */
  onDownloadPdf?: () => void
  /** PDF 생성 중 여부 */
  isGeneratingPdf?: boolean
}

export function InvoiceActions({
  invoice,
  onDownloadPdf,
  isGeneratingPdf = false,
}: InvoiceActionsProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 뒤로 가기 버튼 (왼쪽) */}
      <Button
        variant="outline"
        onClick={() => router.push("/invoices")}
        className="w-full sm:w-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        목록으로
      </Button>

      {/* 주요 액션 버튼들 (오른쪽) */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* 공유 링크 생성 버튼 */}
        <Button
          variant="outline"
          onClick={() => router.push(`/invoices/${invoice.id}/shares`)}
          className="w-full sm:w-auto"
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          공유 링크 관리
        </Button>

        {/* PDF 다운로드 버튼 */}
        <Button
          onClick={onDownloadPdf ?? (() => {})}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto"
          aria-busy={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <>
              {/* TODO: PDF 생성 중 로딩 처리 */}
              <Download className="mr-2 h-4 w-4 animate-bounce" aria-hidden="true" />
              PDF 생성 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              PDF 다운로드
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
