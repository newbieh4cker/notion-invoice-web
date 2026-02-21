"use client"

/**
 * 견적서 상세 헤더 컴포넌트
 * 견적서 번호, 발행일, 유효기간, 상태 배지 표시
 * 뒤로 가기 버튼 포함
 */

import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/invoice/status-badge"
import { formatDate } from "@/lib/format"
import type { Invoice } from "@/types/invoice"

interface InvoiceHeaderProps {
  /** 견적서 데이터 */
  invoice: Invoice
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* 뒤로 가기 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2"
        aria-label="이전 페이지로 이동"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
        목록으로
      </Button>

      {/* 견적서 헤더 정보 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {/* 견적서 번호 */}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {invoice.invoiceNumber}
          </h1>
          {/* 발행 회사명 */}
          <p className="text-muted-foreground">{invoice.companyName}</p>
        </div>

        {/* 상태 배지 */}
        <div className="flex items-center">
          <StatusBadge status={invoice.status} size="lg" />
        </div>
      </div>

      {/* 날짜 정보 영역 */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {/* 발행일 */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            발행일: <span className="text-foreground">{formatDate(invoice.issueDate)}</span>
          </span>
        </div>
        {/* 유효기간 */}
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            유효기간: <span className="text-foreground">{formatDate(invoice.expiryDate)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
