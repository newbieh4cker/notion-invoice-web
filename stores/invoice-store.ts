/**
 * 견적서 Zustand 스토어
 * 견적서 목록, 필터, 검색, 정렬 상태를 관리
 * devtools 미들웨어 적용 (개발 환경 디버깅 지원)
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Invoice, InvoiceStatus } from "@/types/invoice"

/** 정렬 기준 필드 */
export type InvoiceSortBy = "createdAt" | "updatedAt" | "totalAmount" | "clientName" | "invoiceNumber"

/** 정렬 방향 */
export type SortOrder = "asc" | "desc"

/** 날짜 범위 필터 */
export interface DateRange {
  from: string | null
  to: string | null
}

/** 금액 범위 필터 */
export interface AmountRange {
  min: number | null
  max: number | null
}

/** 필터 상태 */
export interface InvoiceFilter {
  /** 상태 필터 (null = 전체) */
  status: InvoiceStatus | null
  /** 발행일 범위 */
  dateRange: DateRange
  /** 금액 범위 */
  amountRange: AmountRange
}

/** 견적서 스토어 상태 */
interface InvoiceState {
  /** 전체 견적서 목록 */
  invoices: Invoice[]
  /** 현재 선택된 견적서 (상세 보기용) */
  selectedInvoice: Invoice | null
  /** 필터 상태 */
  filter: InvoiceFilter
  /** 검색어 */
  searchTerm: string
  /** 정렬 기준 */
  sortBy: InvoiceSortBy
  /** 정렬 방향 */
  sortOrder: SortOrder
  /** 로딩 상태 */
  isLoading: boolean
}

/** 견적서 스토어 액션 */
interface InvoiceActions {
  /** 견적서 목록 전체 교체 */
  setInvoices: (invoices: Invoice[]) => void
  /** 단일 견적서 추가 */
  addInvoice: (invoice: Invoice) => void
  /** 견적서 수정 (id 기준) */
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  /** 견적서 삭제 (id 기준) */
  removeInvoice: (id: string) => void
  /** 선택된 견적서 설정 */
  setSelectedInvoice: (invoice: Invoice | null) => void
  /** 필터 상태 업데이트 (부분 업데이트 지원) */
  setFilter: (filter: Partial<InvoiceFilter>) => void
  /** 필터 초기화 */
  resetFilter: () => void
  /** 검색어 설정 */
  setSearchTerm: (term: string) => void
  /** 정렬 기준 설정 (동일 기준 재클릭 시 방향 토글) */
  setSortBy: (sortBy: InvoiceSortBy) => void
  /** 정렬 방향 직접 설정 */
  setSortOrder: (order: SortOrder) => void
  /** 로딩 상태 설정 */
  setIsLoading: (loading: boolean) => void
  /** 필터/검색/정렬이 적용된 견적서 목록 반환 */
  getFilteredInvoices: () => Invoice[]
}

/** 필터 초기값 */
const initialFilter: InvoiceFilter = {
  status: null,
  dateRange: {
    from: null,
    to: null,
  },
  amountRange: {
    min: null,
    max: null,
  },
}

/** 견적서 스토어 */
export const useInvoiceStore = create<InvoiceState & InvoiceActions>()(
  devtools(
    (set, get) => ({
      // ─── 초기 상태 ───────────────────────────────────────────────
      invoices: [],
      selectedInvoice: null,
      filter: initialFilter,
      searchTerm: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      isLoading: false,

      // ─── 견적서 CRUD 액션 ─────────────────────────────────────────
      setInvoices: (invoices) => {
        set({ invoices }, false, "invoice/setInvoices")
      },

      addInvoice: (invoice) => {
        set(
          (state) => ({ invoices: [invoice, ...state.invoices] }),
          false,
          "invoice/addInvoice"
        )
      },

      updateInvoice: (id, updates) => {
        set(
          (state) => ({
            invoices: state.invoices.map((inv) =>
              inv.id === id
                ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
                : inv
            ),
            // 선택된 견적서도 동기화
            selectedInvoice:
              state.selectedInvoice?.id === id
                ? { ...state.selectedInvoice, ...updates }
                : state.selectedInvoice,
          }),
          false,
          "invoice/updateInvoice"
        )
      },

      removeInvoice: (id) => {
        set(
          (state) => ({
            invoices: state.invoices.filter((inv) => inv.id !== id),
            selectedInvoice:
              state.selectedInvoice?.id === id ? null : state.selectedInvoice,
          }),
          false,
          "invoice/removeInvoice"
        )
      },

      setSelectedInvoice: (invoice) => {
        set({ selectedInvoice: invoice }, false, "invoice/setSelectedInvoice")
      },

      // ─── 필터/검색/정렬 액션 ──────────────────────────────────────
      setFilter: (filter) => {
        set(
          (state) => ({ filter: { ...state.filter, ...filter } }),
          false,
          "invoice/setFilter"
        )
      },

      resetFilter: () => {
        set({ filter: initialFilter, searchTerm: "" }, false, "invoice/resetFilter")
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term }, false, "invoice/setSearchTerm")
      },

      setSortBy: (sortBy) => {
        set(
          (state) => ({
            sortBy,
            // 동일 기준을 다시 클릭하면 방향 토글
            sortOrder:
              state.sortBy === sortBy
                ? state.sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "desc",
          }),
          false,
          "invoice/setSortBy"
        )
      },

      setSortOrder: (order) => {
        set({ sortOrder: order }, false, "invoice/setSortOrder")
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading }, false, "invoice/setIsLoading")
      },

      // ─── 파생 데이터 (필터 + 검색 + 정렬 적용) ─────────────────────
      getFilteredInvoices: () => {
        const { invoices, filter, searchTerm, sortBy, sortOrder } = get()

        let result = [...invoices]

        // 상태 필터 적용
        if (filter.status !== null) {
          result = result.filter((inv) => inv.status === filter.status)
        }

        // 날짜 범위 필터 적용
        if (filter.dateRange.from) {
          const from = new Date(filter.dateRange.from)
          result = result.filter((inv) => new Date(inv.issueDate) >= from)
        }
        if (filter.dateRange.to) {
          const to = new Date(filter.dateRange.to)
          // 종료일은 해당 날짜 끝까지 포함
          to.setHours(23, 59, 59, 999)
          result = result.filter((inv) => new Date(inv.issueDate) <= to)
        }

        // 금액 범위 필터 적용
        if (filter.amountRange.min !== null) {
          result = result.filter((inv) => inv.totalAmount >= filter.amountRange.min!)
        }
        if (filter.amountRange.max !== null) {
          result = result.filter((inv) => inv.totalAmount <= filter.amountRange.max!)
        }

        // 검색어 필터 적용 (거래처명, 견적서 번호, 이메일)
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase()
          result = result.filter(
            (inv) =>
              inv.clientName.toLowerCase().includes(term) ||
              inv.invoiceNumber.toLowerCase().includes(term) ||
              inv.clientEmail.toLowerCase().includes(term)
          )
        }

        // 정렬 적용
        result.sort((a, b) => {
          let comparison = 0

          switch (sortBy) {
            case "createdAt":
              comparison =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              break
            case "updatedAt":
              comparison =
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
              break
            case "totalAmount":
              comparison = a.totalAmount - b.totalAmount
              break
            case "clientName":
              comparison = a.clientName.localeCompare(b.clientName, "ko")
              break
            case "invoiceNumber":
              comparison = a.invoiceNumber.localeCompare(b.invoiceNumber)
              break
          }

          return sortOrder === "asc" ? comparison : -comparison
        })

        return result
      },
    }),
    {
      name: "invoice-store", // Redux DevTools 에서 표시될 스토어 이름
    }
  )
)
