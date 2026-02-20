/**
 * 공유 토큰 관련 타입 정의
 * 공유 링크 접근 제어를 위한 토큰 모델
 */

/** 공유 토큰 (AccessToken) */
export interface AccessToken {
  id: string
  token: string
  invoiceId: string
  clientEmail: string
  expiresAt: string
  createdAt: string
  lastAccessedAt: string | null
  isRevoked: boolean
}

/** 토큰 생성 요청 */
export interface CreateTokenRequest {
  invoiceId: string
  clientEmail: string
  /** 유효기간 (일 단위, 기본값 30일) */
  expiresInDays: number
}

/** 토큰 검증 결과 */
export type TokenValidationResult =
  | { valid: true; token: AccessToken }
  | { valid: false; reason: "expired" | "invalid" | "not_found" }
