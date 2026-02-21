"use server"

/**
 * 견적서 관련 서버 액션
 * 노션 API를 통한 견적서 CRUD 작업
 */

import { getInvoices, getInvoiceById, getInvoiceItems } from "@/lib/notion"
import type { Invoice, InvoiceItem } from "@/types/invoice"

/** 서버 액션 응답 타입 */
interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 견적서 목록 조회 서버 액션
 * @param status 상태 필터 (선택)
 */
export async function getInvoiceListAction(
  status?: string
): Promise<ActionResult<Invoice[]>> {
  try {
    const invoices = await getInvoices(status ? { status } : undefined)

    return {
      success: true,
      data: invoices,
    }
  } catch (error: unknown) {
    console.error("견적서 목록 조회 실패:", error)
    return {
      success: false,
      error: "견적서 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  }
}

/**
 * 견적서 상세 조회 서버 액션
 * 견적 항목도 함께 조회
 * @param id 견적서 ID (노션 페이지 ID)
 */
export async function getInvoiceDetailAction(
  id: string
): Promise<ActionResult<{ invoice: Invoice; items: InvoiceItem[] }>> {
  try {
    if (!id) {
      return { success: false, error: "견적서 ID가 필요합니다." }
    }

    const invoice = await getInvoiceById(id)

    if (!invoice) {
      return { success: false, error: "견적서를 찾을 수 없습니다." }
    }

    return {
      success: true,
      data: { invoice, items: invoice.items },
    }
  } catch (error: unknown) {
    console.error("견적서 상세 조회 실패:", error)
    return {
      success: false,
      error: "견적서 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  }
}
