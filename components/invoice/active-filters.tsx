"use client"

/**
 * 활성 필터 태그 컴포넌트
 * 현재 적용 중인 모든 필터를 Badge로 표시
 * 각 필터를 개별적으로 제거 가능
 */

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInvoiceStore } from "@/stores/invoice-store"
import { INVOICE_STATUS_LABELS } from "@/types/invoice"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

/**
 * 활성 필터 표시 및 제거
 * - 상태 필터
 * - 날짜 범위
 * - 금액 범위
 * - 검색어
 */
export function ActiveFilters() {
  const { filter, searchTerm, setFilter, setSearchTerm, resetFilter } =
    useInvoiceStore()

  const filters = []

  // 상태 필터
  if (filter.status) {
    filters.push({
      id: "status",
      label: INVOICE_STATUS_LABELS[filter.status],
      onRemove: () => setFilter({ status: null }),
    })
  }

  // 날짜 범위 필터
  if (filter.dateRange.from || filter.dateRange.to) {
    const from = filter.dateRange.from
      ? format(new Date(filter.dateRange.from), "MMM dd", { locale: ko })
      : "시작"
    const to = filter.dateRange.to
      ? format(new Date(filter.dateRange.to), "MMM dd", { locale: ko })
      : "종료"

    filters.push({
      id: "dateRange",
      label: `${from} ~ ${to}`,
      onRemove: () =>
        setFilter({
          dateRange: { from: null, to: null },
        }),
    })
  }

  // 금액 범위 필터
  if (
    filter.amountRange.min !== null ||
    filter.amountRange.max !== null
  ) {
    const min = filter.amountRange.min
      ? (filter.amountRange.min / 10000).toFixed(0)
      : "0"
    const max = filter.amountRange.max
      ? (filter.amountRange.max / 10000).toFixed(0)
      : "무제한"

    filters.push({
      id: "amountRange",
      label: `${min}만원 ~ ${max}만원`,
      onRemove: () =>
        setFilter({
          amountRange: { min: null, max: null },
        }),
    })
  }

  // 검색어 필터
  if (searchTerm.trim()) {
    filters.push({
      id: "search",
      label: `"${searchTerm}"`,
      onRemove: () => setSearchTerm(""),
    })
  }

  if (filters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <Badge
          key={f.id}
          variant="secondary"
          className="gap-1.5 pl-2.5 pr-1"
        >
          {f.label}
          <Button
            variant="ghost"
            size="sm"
            onClick={f.onRemove}
            className="h-4 w-4 p-0 hover:bg-transparent"
            aria-label={`${f.label} 필터 제거`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* 모든 필터 초기화 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetFilter}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        모두 초기화
      </Button>
    </div>
  )
}
