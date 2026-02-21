"use server"

/**
 * 견적서 관련 서버 액션
 * 노션 API를 통한 견적서 CRUD 작업
 * 서버 사이드 입력값 검증으로 방어적 프로그래밍 적용
 */

import { z } from "zod"
import { getInvoices, getInvoiceById, updateInvoiceStatus } from "@/lib/notion"
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types/invoice"

/** 서버 액션 응답 타입 */
interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/** 견적서 상태 유효값 목록 */
const VALID_STATUSES = ["draft", "sent", "viewed", "paid"] as const

/** 견적서 목록 조회 파라미터 스키마 */
const getInvoiceListSchema = z.object({
  status: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (VALID_STATUSES as readonly string[]).includes(val),
      { message: "유효하지 않은 상태 필터입니다" }
    ),
})

/** 견적서 ID 스키마 (노션 페이지 ID 형식) */
const invoiceIdSchema = z
  .string()
  .min(1, "견적서 ID가 필요합니다")
  .max(36, "유효하지 않은 견적서 ID 형식입니다")
  .regex(
    /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i,
    "유효하지 않은 견적서 ID 형식입니다"
  )

/** 견적서 상태 업데이트 스키마 */
const updateStatusSchema = z.object({
  invoiceId: invoiceIdSchema,
  newStatus: z
    .string()
    .refine(
      (val) => (VALID_STATUSES as readonly string[]).includes(val),
      { message: "유효하지 않은 견적서 상태입니다" }
    ),
})

/**
 * 견적서 목록 조회 서버 액션
 * @param status 상태 필터 (선택): draft | sent | viewed | paid
 */
export async function getInvoiceListAction(
  status?: string
): Promise<ActionResult<Invoice[]>> {
  // 서버 사이드 입력값 검증
  const validation = getInvoiceListSchema.safeParse({ status })
  if (!validation.success) {
    return {
      success: false,
      error: "유효하지 않은 상태 필터입니다.",
    }
  }

  try {
    const validatedStatus = validation.data.status
    const effectiveStatus =
      validatedStatus && validatedStatus !== "" ? validatedStatus : undefined

    const invoices = await getInvoices(
      effectiveStatus ? { status: effectiveStatus } : undefined
    )

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
  // 서버 사이드 ID 검증
  const validation = invoiceIdSchema.safeParse(id)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "유효하지 않은 견적서 ID입니다.",
    }
  }

  try {
    const invoice = await getInvoiceById(validation.data)

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

/**
 * 견적서 상태 업데이트 서버 액션 (F003)
 * 클라이언트가 견적서를 열람할 때 상태를 변경 (예: sent → viewed)
 */
export async function updateInvoiceStatusAction(
  invoiceId: string,
  newStatus: InvoiceStatus
): Promise<ActionResult<void>> {
  // 서버 사이드 입력값 이중 검증
  const validation = updateStatusSchema.safeParse({ invoiceId, newStatus })
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? "유효하지 않은 요청입니다.",
    }
  }

  try {
    await updateInvoiceStatus(
      validation.data.invoiceId,
      validation.data.newStatus as InvoiceStatus
    )
    return { success: true }
  } catch (error: unknown) {
    console.error("견적서 상태 업데이트 실패:", error)
    return {
      success: false,
      error: "견적서 상태 업데이트에 실패했습니다.",
    }
  }
}
