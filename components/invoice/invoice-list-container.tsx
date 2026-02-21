"use client"

/**
 * 견적서 목록 클라이언트 컨테이너 컴포넌트
 * Zustand 스토어 초기화 및 필터/검색/정렬/테이블 통합
 * 서버 컴포넌트에서 받은 더미 데이터를 스토어에 적재
 */

import { useEffect } from "react"
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
  const setInvoices = useInvoiceStore((s) => s.setInvoices)

  // 컴포넌트 마운트 시 스토어에 초기 데이터 적재
  useEffect(() => {
    setInvoices(initialInvoices)
  }, [initialInvoices, setInvoices])

  return (
    <div className="space-y-4">
      {/* 필터 탭 영역 */}
      <InvoiceFilters />

      {/* 검색 및 정렬 컨트롤 영역 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InvoiceSearch />
        <InvoiceSort />
      </div>

      {/* 견적서 테이블 */}
      <InvoiceTable />
    </div>
  )
}
