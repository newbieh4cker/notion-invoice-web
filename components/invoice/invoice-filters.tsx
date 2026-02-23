"use client"

/**
 * 견적서 필터 컴포넌트
 * - Tabs 기반 상태별 필터링 (전체/초안/발송/열람/지불)
 * - 날짜 범위 필터
 * - 금액 범위 필터
 * - 활성 필터 태그 표시 및 개별 제거
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInvoiceStore } from "@/stores/invoice-store"
import type { Invoice, InvoiceStatus } from "@/types/invoice"
import { DateRangeFilter } from "./date-range-filter"
import { AmountRangeFilter } from "./amount-range-filter"
import { ActiveFilters } from "./active-filters"

/** 탭 구성 타입 */
interface TabConfig {
  value: string
  label: string
  status: InvoiceStatus | null
}

/** 탭 목록 설정 */
const TAB_CONFIG: TabConfig[] = [
  { value: "all", label: "전체", status: null },
  { value: "draft", label: "초안", status: "draft" },
  { value: "sent", label: "발송", status: "sent" },
  { value: "viewed", label: "열람", status: "viewed" },
  { value: "paid", label: "지불", status: "paid" },
]

interface InvoiceFiltersProps {
  /** 카운트 계산에 사용할 견적서 목록 (서버에서 직접 전달) */
  invoices: Invoice[]
}

export function InvoiceFilters({ invoices }: InvoiceFiltersProps) {
  const { filter, setFilter } = useInvoiceStore()

  // 현재 활성 탭 값 결정
  const activeTab = filter.status ?? "all"

  // 각 상태별 견적서 수 계산 (서버 데이터 기준)
  const countByStatus = (status: InvoiceStatus | null) => {
    if (status === null) return invoices.length
    return invoices.filter((inv) => inv.status === status).length
  }

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    const tab = TAB_CONFIG.find((t) => t.value === value)
    if (tab) {
      setFilter({ status: tab.status })
    }
  }

  return (
    <div className="space-y-4">
      {/* 상태 필터 탭 */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto flex-wrap gap-1">
          {TAB_CONFIG.map((tab) => {
            const count = countByStatus(tab.status)
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5"
              >
                {tab.label}
                {/* 상태별 견적서 수 배지 */}
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">
                  {count}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* 추가 필터 버튼 영역 */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter />
        <AmountRangeFilter />
      </div>

      {/* 활성 필터 태그 */}
      <ActiveFilters />
    </div>
  )
}
