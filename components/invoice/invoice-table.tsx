"use client"

/**
 * 견적서 목록 테이블 컴포넌트
 * 필터/검색/정렬이 적용된 견적서 목록 표시
 * invoices와 UI 상태를 props로 받아 useMemo로 필터링/정렬 처리
 * (SSR 데이터를 useEffect 없이 즉시 렌더링)
 */

import { useMemo } from "react"
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
import { formatCurrency, formatDate } from "@/lib/format"
import { FileSearch, ExternalLink } from "lucide-react"
import type { Invoice } from "@/types/invoice"
import type { InvoiceFilter, InvoiceSortBy, SortOrder } from "@/stores/invoice-store"

interface InvoiceTableProps {
  /** 서버에서 전달된 전체 견적서 목록 */
  invoices: Invoice[]
  /** 현재 적용된 필터 상태 */
  filter: InvoiceFilter
  /** 검색어 */
  searchTerm: string
  /** 정렬 기준 */
  sortBy: InvoiceSortBy
  /** 정렬 방향 */
  sortOrder: SortOrder
}

export function InvoiceTable({
  invoices,
  filter,
  searchTerm,
  sortBy,
  sortOrder,
}: InvoiceTableProps) {
  const router = useRouter()

  // 필터/검색/정렬 적용된 견적서 목록 (메모이제이션으로 불필요한 재계산 방지)
  const filteredInvoices = useMemo(() => {
    let result = [...invoices]

    // 상태 필터 적용
    if (filter.status !== null) {
      result = result.filter((inv) => inv.status === filter.status)
    }

    // 날짜 범위 필터 적용
    if (filter.dateRange.from) {
      const from = new Date(filter.dateRange.from)
      result = result.filter((inv) => inv.issueDate && new Date(inv.issueDate) >= from)
    }
    if (filter.dateRange.to) {
      const to = new Date(filter.dateRange.to)
      to.setHours(23, 59, 59, 999)
      result = result.filter((inv) => inv.issueDate && new Date(inv.issueDate) <= to)
    }

    // 금액 범위 필터 적용
    if (filter.amountRange.min !== null) {
      result = result.filter((inv) => (inv.totalAmount || 0) >= filter.amountRange.min!)
    }
    if (filter.amountRange.max !== null) {
      result = result.filter((inv) => (inv.totalAmount || 0) <= filter.amountRange.max!)
    }

    // 검색어 필터 적용 (거래처명, 견적서 번호, 이메일)
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      result = result.filter(
        (inv) =>
          inv.clientName?.toLowerCase().includes(term) ||
          inv.invoiceNumber?.toLowerCase().includes(term) ||
          inv.clientEmail?.toLowerCase().includes(term)
      )
    }

    // 정렬 적용
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "createdAt":
          // createdAt이 없으면 issueDate로 폴백
          comparison =
            new Date(a.createdAt || a.issueDate || "").getTime() -
            new Date(b.createdAt || b.issueDate || "").getTime()
          break
        case "updatedAt":
          comparison =
            new Date(a.updatedAt || a.issueDate || "").getTime() -
            new Date(b.updatedAt || b.issueDate || "").getTime()
          break
        case "totalAmount":
          comparison = (a.totalAmount || 0) - (b.totalAmount || 0)
          break
        case "clientName":
          comparison = (a.clientName || "").localeCompare(b.clientName || "", "ko")
          break
        case "invoiceNumber":
          comparison = (a.invoiceNumber || "").localeCompare(b.invoiceNumber || "")
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return result
  }, [invoices, filter, searchTerm, sortBy, sortOrder])

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
              className="cursor-pointer hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group"
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
