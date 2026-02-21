"use client"

/**
 * 견적서 목록 테이블 컴포넌트
 * 필터/검색/정렬이 적용된 견적서 목록 표시
 * Zustand 스토어의 getFilteredInvoices() 활용
 */

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/invoice/status-badge"
import { EmptyState } from "@/components/common/empty-state"
import { useInvoiceStore } from "@/stores/invoice-store"
import { formatCurrency, formatDate } from "@/lib/format"
import { FileSearch, ExternalLink } from "lucide-react"

export function InvoiceTable() {
  const router = useRouter()
  const getFilteredInvoices = useInvoiceStore((s) => s.getFilteredInvoices)

  // 필터/검색/정렬 적용된 견적서 목록
  const filteredInvoices = getFilteredInvoices()

  // 데이터가 없을 때 EmptyState 표시
  if (filteredInvoices.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="견적서가 없습니다"
        description="검색 조건에 맞는 견적서가 없습니다. 필터를 변경해보세요."
      />
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">견적서 번호</TableHead>
            <TableHead>클라이언트</TableHead>
            {/* 태블릿 이상에서 발행일 표시 */}
            <TableHead className="hidden md:table-cell">발행일</TableHead>
            {/* 태블릿 이상에서 금액 표시 */}
            <TableHead className="hidden md:table-cell text-right">금액</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right pr-4">상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
              role="button"
              aria-label={`${invoice.invoiceNumber} 상세 보기`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/invoices/${invoice.id}`)
                }
              }}
            >
              <TableCell className="pl-4 font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invoice.clientName}</p>
                  {/* 모바일에서 이메일 보조 표시 */}
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {invoice.clientEmail}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatDate(invoice.issueDate)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-right font-medium">
                {formatCurrency(invoice.totalAmount)}
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} size="sm" />
              </TableCell>
              <TableCell className="text-right pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    // 행 클릭 이벤트와 버튼 클릭 이벤트 중복 방지
                    e.stopPropagation()
                    router.push(`/invoices/${invoice.id}`)
                  }}
                  aria-label={`${invoice.invoiceNumber} 상세 보기`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
