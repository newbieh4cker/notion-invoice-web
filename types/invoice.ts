/**
 * 견적서 관련 타입 정의
 * 노션 DB의 데이터 모델을 기반으로 함
 */

/** 견적서 상태 */
export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid"

/** 견적서 항목 (노션 항목 DB) */
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  invoiceId: string
}

/** 견적서 (노션 견적서 DB) */
export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  issueDate: string
  expiryDate: string
  companyName: string
  totalAmount: number
  status: InvoiceStatus
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

/** 견적서 목록 조회용 (항목 제외) */
export type InvoiceListItem = Omit<Invoice, "items">

/**
 * 견적서 목록 조회 결과 (페이지네이션 포함)
 * 노션 API cursor 기반 페이지네이션 결과 타입
 */
export interface InvoiceListResult {
  /** 견적서 목록 */
  invoices: Invoice[]
  /** 다음 페이지 cursor (없으면 null) */
  nextCursor: string | null
  /** 다음 페이지 존재 여부 */
  hasMore: boolean
}

/** 견적서 상태 레이블 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "초안",
  sent: "발송",
  viewed: "열람",
  paid: "지불",
}
