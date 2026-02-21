"use client"

/**
 * 견적서 정렬 컴포넌트
 * Select 기반 정렬 기준 선택
 * Zustand 스토어의 setSortBy, setSortOrder와 연동
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInvoiceStore } from "@/stores/invoice-store"
import type { InvoiceSortBy, SortOrder } from "@/stores/invoice-store"

/** 정렬 옵션 타입 */
interface SortOption {
  /** Select 컴포넌트에서 사용할 고유값 (sortBy+order 조합) */
  value: string
  label: string
  sortBy: InvoiceSortBy
  order: SortOrder
}

/** 정렬 옵션 목록 */
const SORT_OPTIONS: SortOption[] = [
  {
    value: "createdAt_desc",
    label: "발행일순 (최신)",
    sortBy: "createdAt",
    order: "desc",
  },
  {
    value: "createdAt_asc",
    label: "발행일순 (오래된)",
    sortBy: "createdAt",
    order: "asc",
  },
  {
    value: "totalAmount_desc",
    label: "금액순 (높음)",
    sortBy: "totalAmount",
    order: "desc",
  },
  {
    value: "totalAmount_asc",
    label: "금액순 (낮음)",
    sortBy: "totalAmount",
    order: "asc",
  },
  {
    value: "clientName_asc",
    label: "클라이언트명 (가나다순)",
    sortBy: "clientName",
    order: "asc",
  },
]

export function InvoiceSort() {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useInvoiceStore()

  // 현재 선택된 정렬 옵션 값 계산
  const currentValue = `${sortBy}_${sortOrder}`

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    const option = SORT_OPTIONS.find((opt) => opt.value === value)
    if (option) {
      // sortBy가 달라지는 경우 setSortBy (방향 토글 없이 직접 적용)
      setSortBy(option.sortBy)
      setSortOrder(option.order)
    }
  }

  return (
    <Select value={currentValue} onValueChange={handleSortChange}>
      <SelectTrigger
        className="w-full sm:w-[200px]"
        aria-label="견적서 정렬 기준 선택"
      >
        <SelectValue placeholder="정렬 기준 선택" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
