"use server"

/**
 * 공유 토큰 관련 서버 액션
 * 노션 DB를 통한 토큰 생성/조회/무효화
 */

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { generateToken, calculateExpiryDate } from "@/lib/token"
import {
  saveAccessToken,
  revokeAccessToken,
  getAccessTokensByInvoiceId,
} from "@/lib/notion"
import type { CreateTokenRequest, AccessToken } from "@/types"

/** 토큰 생성 요청 유효성 검사 스키마 */
const createTokenSchema = z.object({
  invoiceId: z.string().min(1, "견적서 ID가 필요합니다"),
  clientEmail: z.string().email("올바른 이메일 주소를 입력해주세요"),
  expiresInDays: z.number().int().min(1).max(365).default(30),
})

/** 서버 액션 응답 타입 */
interface TokenActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

/** 토큰 생성 결과 */
interface CreateTokenResult {
  token: AccessToken
  shareUrl: string
}

/**
 * 공유 토큰 생성 서버 액션 (F002)
 * 노션 DB에 토큰 저장 후 공유 URL 반환
 */
export async function createTokenAction(
  request: CreateTokenRequest
): Promise<TokenActionResult<CreateTokenResult>> {
  const validation = createTokenSchema.safeParse(request)

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { invoiceId, clientEmail, expiresInDays } = validation.data

  try {
    const tokenValue = generateToken()
    const expiresAt = calculateExpiryDate(expiresInDays)

    // 노션 DB에 토큰 저장
    const savedToken = await saveAccessToken({
      token: tokenValue,
      invoiceId,
      clientEmail,
      expiresAt,
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${tokenValue}`

    // 공유 페이지 캐시 갱신
    revalidatePath(`/invoices/${invoiceId}/shares`)

    return {
      success: true,
      data: {
        token: savedToken,
        shareUrl,
      },
    }
  } catch (error: unknown) {
    console.error("토큰 생성 실패:", error)
    return {
      success: false,
      error: "공유 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  }
}

/**
 * 토큰 무효화 서버 액션 (F002)
 * 노션 DB에서 토큰의 isRevoked 필드를 true로 업데이트
 */
export async function revokeTokenAction(
  tokenId: string
): Promise<TokenActionResult> {
  if (!tokenId) {
    return { success: false, error: "토큰 ID가 필요합니다" }
  }

  try {
    await revokeAccessToken(tokenId)

    return { success: true }
  } catch (error: unknown) {
    console.error("토큰 무효화 실패:", error)
    return {
      success: false,
      error: "토큰 무효화에 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  }
}

/**
 * 특정 견적서의 토큰 목록 조회 서버 액션
 */
export async function getTokenListAction(
  invoiceId: string
): Promise<TokenActionResult<AccessToken[]>> {
  if (!invoiceId) {
    return { success: false, error: "견적서 ID가 필요합니다" }
  }

  try {
    const tokens = await getAccessTokensByInvoiceId(invoiceId)
    return { success: true, data: tokens }
  } catch (error: unknown) {
    console.error("토큰 목록 조회 실패:", error)
    return {
      success: false,
      error: "공유 링크 목록을 불러오는 데 실패했습니다.",
    }
  }
}
