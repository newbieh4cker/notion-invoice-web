"use client"

/**
 * 견적서 목록 클라이언트 컨테이너 컴포넌트
 * 서버에서 전달된 초기 데이터를 바탕으로 필터/검색/정렬/테이블 통합
 * useEffect + Zustand 스토어 주입 방식 대신, props 직접 전달 방식 사용
 * (Zustand는 UI 상태인 필터/검색/정렬 값만 관리)
 */

import { InvoiceFilters } from "@/components/invoice/invoice-filters"
import { InvoiceSearch } from "@/components/invoice/invoice-search"
import { InvoiceSort } from "@/components/invoice/invoice-sort"
import { InvoiceTable } from "@/components/invoice/invoice-table"
import { useInvoiceStore } from "@/stores/invoice-store"
import type { Invoice } from "@/types/invoice"

interface InvoiceListContainerProps {
  /** 서버에서 전달된 초기 견적서 목록 */
  initialInvoices: Invoice[]
}

export function InvoiceListContainer({ initialInvoices }: InvoiceListContainerProps) {
  // UI 상태(필터, 검색, 정렬)만 Zustand에서 구독
  const filter = useInvoiceStore((s) => s.filter)
  const searchTerm = useInvoiceStore((s) => s.searchTerm)
  const sortBy = useInvoiceStore((s) => s.sortBy)
  const sortOrder = useInvoiceStore((s) => s.sortOrder)

  return (
    <div className="space-y-4">
      {/* 필터 탭 - initialInvoices를 직접 전달하여 카운트 계산 */}
      <InvoiceFilters invoices={initialInvoices} />

      {/* 검색 및 정렬 컨트롤 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InvoiceSearch />
        <InvoiceSort />
      </div>

      {/* 견적서 테이블 - 데이터와 UI 상태를 모두 props로 전달 */}
      <InvoiceTable
        invoices={initialInvoices}
        filter={filter}
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  )
}
