import { Client } from "@notionhq/client"
import type {
  PageObjectResponse,
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints"
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types/invoice"
import type { AccessToken } from "@/types/token"

/**
 * 노션 API 클라이언트 싱글톤
 * 서버 사이드에서만 사용 가능
 */
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

/** 노션 DB ID 상수 */
export const NOTION_DB = {
  INVOICES: process.env.NOTION_INVOICES_DB_ID ?? "",
  INVOICE_ITEMS: process.env.NOTION_INVOICE_ITEMS_DB_ID ?? "",
  ACCESS_TOKENS: process.env.NOTION_ACCESS_TOKENS_DB_ID ?? "",
} as const

// ─── 에러 핸들링 + 재시도 ──────────────────────────────────────────

/** 재시도 가능한 HTTP 상태 코드 */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

/**
 * 지수 백오프 기반 재시도 래퍼
 * 429(Rate Limit), 500/502/503/504(서버 오류)만 재시도
 * 400/401/403/404는 즉시 실패 처리
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error

      // 노션 API 에러에서 상태 코드 추출
      const statusCode = getErrorStatusCode(error)

      // 재시도 불가능한 에러는 즉시 throw
      if (statusCode !== null && !RETRYABLE_STATUS_CODES.has(statusCode)) {
        throw error
      }

      // 마지막 시도였으면 throw
      if (attempt === maxAttempts) {
        throw error
      }

      // 지수 백오프 대기 (1초, 2초, 4초...)
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/** 에러 객체에서 HTTP 상태 코드 추출 */
function getErrorStatusCode(error: unknown): number | null {
  if (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status
  }
  return null
}

// ─── 노션 Property 파싱 헬퍼 ───────────────────────────────────────

/** 노션 페이지의 properties 타입 */
type NotionProperties = PageObjectResponse["properties"]
type NotionPropertyValue = NotionProperties[string]

/**
 * 노션 property를 일반 값으로 변환
 * title, rich_text, number, date, select, multi_select, checkbox,
 * relation, url, email, phone_number, created_time, last_edited_time 지원
 */
function propertyToValue(property: NotionPropertyValue): string | number | boolean | string[] | null {
  switch (property.type) {
    case "title":
      return property.title.map((t) => t.plain_text).join("") || ""

    case "rich_text":
      return property.rich_text.map((t) => t.plain_text).join("") || ""

    case "number":
      return property.number ?? 0

    case "date":
      return property.date?.start ?? null

    case "select":
      return property.select?.name ?? null

    case "multi_select":
      return property.multi_select.map((s) => s.name)

    case "checkbox":
      return property.checkbox

    case "relation":
      return property.relation.map((r) => r.id)

    case "url":
      return property.url ?? null

    case "email":
      return property.email ?? null

    case "phone_number":
      return property.phone_number ?? null

    case "created_time":
      return property.created_time

    case "last_edited_time":
      return property.last_edited_time

    case "formula": {
      const formula = property.formula
      if (formula.type === "string") return formula.string ?? null
      if (formula.type === "number") return formula.number ?? 0
      if (formula.type === "boolean") return formula.boolean ?? false
      if (formula.type === "date") return formula.date?.start ?? null
      return null
    }

    case "rollup": {
      const rollup = property.rollup
      if (rollup.type === "number") return rollup.number ?? 0
      if (rollup.type === "date") return rollup.date?.start ?? null
      return null
    }

    case "status":
      return property.status?.name ?? null

    default:
      return null
  }
}

/**
 * 노션 페이지에서 특정 속성의 문자열 값 추출
 */
function getStringProperty(properties: NotionProperties, key: string): string {
  const prop = properties[key]
  if (!prop) return ""
  const value = propertyToValue(prop)
  return typeof value === "string" ? value : ""
}

/**
 * 노션 페이지에서 특정 속성의 숫자 값 추출
 */
function getNumberProperty(properties: NotionProperties, key: string): number {
  const prop = properties[key]
  if (!prop) return 0
  const value = propertyToValue(prop)
  return typeof value === "number" ? value : 0
}

/**
 * 노션 페이지에서 특정 속성의 불리언 값 추출
 */
function getBooleanProperty(properties: NotionProperties, key: string): boolean {
  const prop = properties[key]
  if (!prop) return false
  const value = propertyToValue(prop)
  return typeof value === "boolean" ? value : false
}

/**
 * 노션 페이지에서 relation ID 배열 추출
 */
function getRelationProperty(properties: NotionProperties, key: string): string[] {
  const prop = properties[key]
  if (!prop) return []
  const value = propertyToValue(prop)
  return Array.isArray(value) ? value : []
}

// ─── dataSources.query 래퍼 ────────────────────────────────────────

/**
 * 노션 dataSources.query 호출 래퍼
 * SDK v5에서 databases.query가 dataSources.query로 변경됨
 */
async function queryDataSource(
  params: Omit<QueryDataSourceParameters, "data_source_id"> & { data_source_id: string }
): Promise<PageObjectResponse[]> {
  const response = await notion.dataSources.query(params)

  return response.results.filter(
    (page): page is PageObjectResponse => "properties" in page
  )
}

// ─── 견적서 조회 ────────────────────────────────────────────────────

/** 노션 상태값 → InvoiceStatus 매핑 */
const STATUS_MAP: Record<string, InvoiceStatus> = {
  "초안": "draft",
  "발송": "sent",
  "열람": "viewed",
  "지불": "paid",
  // 영문 키도 지원 (노션 DB 설정에 따라)
  "draft": "draft",
  "Draft": "draft",
  "sent": "sent",
  "Sent": "sent",
  "viewed": "viewed",
  "Viewed": "viewed",
  "paid": "paid",
  "Paid": "paid",
}

/**
 * 노션 페이지를 Invoice 타입으로 변환
 */
function pageToInvoice(page: PageObjectResponse, items: InvoiceItem[] = []): Invoice {
  const props = page.properties

  // Status 속성: 한글/영문 모두 지원, 영문(Status) 먼저 확인
  const statusRaw = getStringProperty(props, "Status") || getStringProperty(props, "상태")
  const status = STATUS_MAP[statusRaw] ?? "draft"

  return {
    id: page.id,
    // Invoice 번호: InvoiceNum (가장 먼저), 그 다음 InvoiceNumber, 견적서번호
    invoiceNumber: getStringProperty(props, "InvoiceNum") || getStringProperty(props, "InvoiceNumber") || getStringProperty(props, "견적서번호"),
    clientName: getStringProperty(props, "ClientName") || getStringProperty(props, "거래처명"),
    clientEmail: getStringProperty(props, "ClientEmail") || getStringProperty(props, "이메일"),
    clientPhone: getStringProperty(props, "ClientPhone") || getStringProperty(props, "전화번호"),
    issueDate: getStringProperty(props, "IssueDate") || getStringProperty(props, "발행일"),
    expiryDate: getStringProperty(props, "ExpiryDate") || getStringProperty(props, "유효기간"),
    companyName: getStringProperty(props, "CompanyName") || getStringProperty(props, "발행자"),
    totalAmount: getNumberProperty(props, "TotalAmount") || getNumberProperty(props, "총금액"),
    status,
    items,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  }
}

/**
 * 노션 페이지를 InvoiceItem 타입으로 변환
 */
function pageToInvoiceItem(page: PageObjectResponse): InvoiceItem {
  const props = page.properties

  // relation에서 견적서/Invoice ID 추출 (Invoice 먼저 확인)
  const invoiceRelation = getRelationProperty(props, "Invoice") || getRelationProperty(props, "견적서")
  const invoiceId = invoiceRelation[0] ?? ""

  return {
    id: page.id,
    // 항목명: ItemName (먼저), 그 다음 Description, 항목명
    description: getStringProperty(props, "ItemName") || getStringProperty(props, "Description") || getStringProperty(props, "항목명"),
    // 수량: Quantity 먼저
    quantity: getNumberProperty(props, "Quantity") || getNumberProperty(props, "수량"),
    // 단가: UnitPrice 먼저
    unitPrice: getNumberProperty(props, "UnitPrice") || getNumberProperty(props, "단가"),
    // 소계: Subtotal 먼저
    totalPrice: getNumberProperty(props, "Subtotal") || getNumberProperty(props, "소계") || getNumberProperty(props, "TotalPrice"),
    invoiceId,
  }
}

/**
 * 견적서 목록 조회
 * @param filters 상태 필터 (선택)
 * @returns 견적서 배열 (항목 제외)
 */
export async function getInvoices(filters?: { status?: string }): Promise<Invoice[]> {
  return withRetry(async () => {
    const queryParams: Omit<QueryDataSourceParameters, "data_source_id"> & { data_source_id: string } = {
      data_source_id: NOTION_DB.INVOICES,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    }

    // 상태 필터 적용
    if (filters?.status) {
      const statusLabel = Object.entries(STATUS_MAP).find(
        ([, v]) => v === filters.status
      )?.[0]

      if (statusLabel) {
        queryParams.filter = {
          or: [
            {
              property: "상태",
              select: { equals: statusLabel },
            },
            {
              property: "Status",
              select: { equals: statusLabel },
            },
          ],
        }
      }
    }

    const pages = await queryDataSource(queryParams)
    return pages.map((page) => pageToInvoice(page))
  })
}

/**
 * 단일 견적서 조회 (ID 기준)
 * 견적 항목도 함께 조회하여 포함
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  return withRetry(async () => {
    try {
      const page = await notion.pages.retrieve({ page_id: id })

      if (!("properties" in page)) {
        return null
      }

      // 견적 항목도 함께 조회
      const items = await getInvoiceItems(id)

      return pageToInvoice(page as PageObjectResponse, items)
    } catch (error: unknown) {
      const statusCode = getErrorStatusCode(error)
      // 404 (not found)인 경우 null 반환
      if (statusCode === 404) {
        return null
      }
      throw error
    }
  })
}

/**
 * 특정 견적서의 항목 목록 조회
 * relation 필터로 해당 견적서에 연결된 항목만 조회
 */
export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  return withRetry(async () => {
    const pages = await queryDataSource({
      data_source_id: NOTION_DB.INVOICE_ITEMS,
      filter: {
        or: [
          {
            property: "견적서",
            relation: { contains: invoiceId },
          },
          {
            property: "Invoice",
            relation: { contains: invoiceId },
          },
        ],
      },
    })

    return pages.map((page) => pageToInvoiceItem(page))
  })
}

// ─── 액세스 토큰 조회/관리 ─────────────────────────────────────────

/**
 * 노션 페이지를 AccessToken 타입으로 변환
 */
function pageToAccessToken(page: PageObjectResponse): AccessToken {
  const props = page.properties

  return {
    id: page.id,
    token: getStringProperty(props, "토큰") || getStringProperty(props, "Token"),
    invoiceId: (() => {
      const relation = getRelationProperty(props, "견적서") || getRelationProperty(props, "Invoice")
      return relation[0] ?? ""
    })(),
    clientEmail: getStringProperty(props, "이메일") || getStringProperty(props, "ClientEmail"),
    expiresAt: getStringProperty(props, "만료일") || getStringProperty(props, "ExpiresAt"),
    createdAt: page.created_time,
    lastAccessedAt: getStringProperty(props, "마지막접근") || getStringProperty(props, "LastAccessedAt") || null,
    isRevoked: getBooleanProperty(props, "폐기") || getBooleanProperty(props, "IsRevoked"),
  }
}

/**
 * 토큰 문자열로 액세스 토큰 조회
 */
export async function getAccessTokenByValue(tokenValue: string): Promise<AccessToken | null> {
  return withRetry(async () => {
    const pages = await queryDataSource({
      data_source_id: NOTION_DB.ACCESS_TOKENS,
      filter: {
        or: [
          {
            property: "토큰",
            rich_text: { equals: tokenValue },
          },
          {
            property: "Token",
            rich_text: { equals: tokenValue },
          },
        ],
      },
      page_size: 1,
    })

    const page = pages[0]
    if (!page) {
      return null
    }

    return pageToAccessToken(page)
  })
}

/**
 * 특정 견적서의 모든 액세스 토큰 조회
 */
export async function getAccessTokensByInvoiceId(invoiceId: string): Promise<AccessToken[]> {
  return withRetry(async () => {
    const pages = await queryDataSource({
      data_source_id: NOTION_DB.ACCESS_TOKENS,
      filter: {
        or: [
          {
            property: "견적서",
            relation: { contains: invoiceId },
          },
          {
            property: "Invoice",
            relation: { contains: invoiceId },
          },
        ],
      },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    })

    return pages.map((page) => pageToAccessToken(page))
  })
}

/**
 * 액세스 토큰 저장 (노션 DB에 새 페이지 생성)
 */
export async function saveAccessToken(data: {
  token: string
  invoiceId: string
  clientEmail: string
  expiresAt: Date
}): Promise<AccessToken> {
  return withRetry(async () => {
    const page = await notion.pages.create({
      parent: { database_id: NOTION_DB.ACCESS_TOKENS },
      properties: {
        "토큰": {
          rich_text: [{ text: { content: data.token } }],
        },
        "견적서": {
          relation: [{ id: data.invoiceId }],
        },
        "이메일": {
          email: data.clientEmail,
        },
        "만료일": {
          date: { start: data.expiresAt.toISOString() },
        },
        "폐기": {
          checkbox: false,
        },
      },
    })

    if (!("properties" in page)) {
      throw new Error("토큰 저장 실패: 생성된 페이지에 속성이 없습니다")
    }

    return pageToAccessToken(page as PageObjectResponse)
  })
}

/**
 * 액세스 토큰 무효화 (isRevoked = true)
 */
export async function revokeAccessToken(tokenId: string): Promise<void> {
  await withRetry(async () => {
    await notion.pages.update({
      page_id: tokenId,
      properties: {
        "폐기": {
          checkbox: true,
        },
      },
    })
  })
}

/**
 * 토큰 마지막 접근일 업데이트
 */
export async function updateTokenLastAccessed(tokenId: string): Promise<void> {
  try {
    await notion.pages.update({
      page_id: tokenId,
      properties: {
        "마지막접근": {
          date: { start: new Date().toISOString() },
        },
      },
    })
  } catch {
    // 마지막 접근일 업데이트 실패는 무시 (핵심 기능이 아님)
    console.warn(`토큰 마지막 접근일 업데이트 실패: ${tokenId}`)
  }
}

/**
 * 액세스 토큰 유효성 검증 (3단계)
 * 1. 존재 여부 확인
 * 2. 폐기 여부 확인
 * 3. 만료 여부 확인
 */
export async function validateAccessToken(tokenValue: string): Promise<{
  isValid: boolean
  reason?: "not_found" | "invalid" | "expired"
  invoiceId?: string
  token?: AccessToken
}> {
  // 1단계: 토큰 존재 여부 확인
  const tokenData = await getAccessTokenByValue(tokenValue)

  if (!tokenData) {
    return { isValid: false, reason: "not_found" }
  }

  // 2단계: 폐기 여부 확인
  if (tokenData.isRevoked) {
    return { isValid: false, reason: "invalid" }
  }

  // 3단계: 만료 여부 확인
  if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
    return { isValid: false, reason: "expired" }
  }

  // 유효한 토큰 - 마지막 접근일 비동기 업데이트 (결과를 기다리지 않음)
  updateTokenLastAccessed(tokenData.id)

  return {
    isValid: true,
    invoiceId: tokenData.invoiceId,
    token: tokenData,
  }
}

/**
 * 견적서 상태 업데이트 (F003)
 * 클라이언트가 견적서를 최초 열람할 때 "sent" → "viewed"로 상태 변경
 */
export async function updateInvoiceStatus(invoiceId: string, newStatus: InvoiceStatus): Promise<void> {
  try {
    // 상태를 한글 라벨로 변환
    const statusLabel = Object.entries(STATUS_MAP).find(
      ([, v]) => v === newStatus
    )?.[0] ?? "초안"

    await withRetry(async () => {
      await notion.pages.update({
        page_id: invoiceId,
        properties: {
          "상태": {
            select: { name: statusLabel },
          },
        },
      })
    })
  } catch (error) {
    // 상태 업데이트 실패는 무시 (핵심 기능이 아님)
    console.warn(`견적서 상태 업데이트 실패: ${invoiceId}`, error)
  }
}
