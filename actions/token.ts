"use server"

import { z } from "zod"
import { generateToken, calculateExpiryDate } from "@/lib/token"
import type { CreateTokenRequest } from "@/types"

/** 토큰 생성 요청 유효성 검사 스키마 */
const createTokenSchema = z.object({
  invoiceId: z.string().min(1, "견적서 ID가 필요합니다"),
  clientEmail: z.string().email("올바른 이메일 주소를 입력해주세요"),
  expiresInDays: z.number().int().min(1).max(365).default(30),
})

/**
 * 공유 토큰 생성 서버 액션 (F002)
 * TODO: 노션 DB 또는 별도 DB에 토큰 저장 로직 구현
 */
export async function createTokenAction(request: CreateTokenRequest) {
  const validation = createTokenSchema.safeParse(request)

  if (!validation.success) {
    return {
      success: false as const,
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { invoiceId, clientEmail, expiresInDays } = validation.data

  const token = generateToken()
  const expiresAt = calculateExpiryDate(expiresInDays)

  // TODO: 노션 DB에 토큰 저장
  // const saved = await saveTokenToNotion({ token, invoiceId, clientEmail, expiresAt })

  return {
    success: true as const,
    data: {
      token,
      invoiceId,
      clientEmail,
      expiresAt: expiresAt.toISOString(),
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${token}`,
    },
  }
}

/**
 * 토큰 무효화 서버 액션 (F002)
 * TODO: 노션 DB에서 토큰 isRevoked 필드 업데이트
 */
export async function revokeTokenAction(tokenId: string) {
  if (!tokenId) {
    return { success: false as const, error: "토큰 ID가 필요합니다" }
  }

  // TODO: 노션 DB에서 토큰 무효화
  // await revokeTokenInNotion(tokenId)

  return { success: true as const }
}
