/**
 * 개발용 더미 토큰 데이터
 * types/token.ts 의 AccessToken 타입을 기반으로 작성
 * 유효한 토큰과 만료/폐기된 토큰을 혼합하여 다양한 시나리오 테스트 지원
 */

import type { AccessToken } from "@/types/token"

/** 더미 공유 토큰 목록 (총 8개, 다양한 상태 포함) */
export const DUMMY_TOKENS: AccessToken[] = [
  // 유효한 토큰 (만료되지 않음, 폐기되지 않음)
  {
    id: "tok-001",
    token: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    invoiceId: "inv-001",
    clientEmail: "contact@startup-alpha.kr",
    expiresAt: "2026-03-05T23:59:59.000Z",
    createdAt: "2026-01-05T09:10:00.000Z",
    lastAccessedAt: "2026-01-20T14:25:00.000Z",
    isRevoked: false,
  },
  {
    id: "tok-002",
    token: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    invoiceId: "inv-002",
    clientEmail: "info@beta-commerce.co.kr",
    expiresAt: "2026-03-10T23:59:59.000Z",
    createdAt: "2026-01-10T10:10:00.000Z",
    lastAccessedAt: "2026-01-15T10:55:00.000Z",
    isRevoked: false,
  },
  {
    id: "tok-003",
    token: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    invoiceId: "inv-003",
    clientEmail: "pm@gamma-agency.com",
    expiresAt: "2026-03-15T23:59:59.000Z",
    createdAt: "2026-01-15T14:05:00.000Z",
    lastAccessedAt: null,
    isRevoked: false,
  },
  {
    id: "tok-004",
    token: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    invoiceId: "inv-005",
    clientEmail: "contact@epsilon-media.kr",
    expiresAt: "2026-03-25T23:59:59.000Z",
    createdAt: "2026-01-25T13:05:00.000Z",
    lastAccessedAt: "2026-02-05T15:50:00.000Z",
    isRevoked: false,
  },
  {
    id: "tok-005",
    token: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    invoiceId: "inv-006",
    clientEmail: "biz@zeta-solution.com",
    expiresAt: "2026-04-01T23:59:59.000Z",
    createdAt: "2026-02-01T10:05:00.000Z",
    lastAccessedAt: null,
    isRevoked: false,
  },

  // 만료된 토큰 (expiresAt 이 현재 시각보다 이전)
  {
    id: "tok-006",
    token: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
    invoiceId: "inv-001",
    clientEmail: "contact@startup-alpha.kr",
    expiresAt: "2026-01-20T23:59:59.000Z", // 이미 만료
    createdAt: "2025-12-20T09:00:00.000Z",
    lastAccessedAt: "2026-01-18T11:00:00.000Z",
    isRevoked: false,
  },
  {
    id: "tok-007",
    token: "a1c3b2d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a9b8",
    invoiceId: "inv-002",
    clientEmail: "info@beta-commerce.co.kr",
    expiresAt: "2026-01-31T23:59:59.000Z", // 이미 만료
    createdAt: "2026-01-01T10:00:00.000Z",
    lastAccessedAt: null,
    isRevoked: false,
  },

  // 폐기된 토큰 (isRevoked = true)
  {
    id: "tok-008",
    token: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
    invoiceId: "inv-003",
    clientEmail: "pm@gamma-agency.com",
    expiresAt: "2026-04-15T23:59:59.000Z", // 만료되지 않았으나 폐기됨
    createdAt: "2026-01-15T14:10:00.000Z",
    lastAccessedAt: "2026-01-16T09:00:00.000Z",
    isRevoked: true,
  },
]

/**
 * 특정 invoiceId 에 연결된 유효한 토큰 목록 반환
 * 만료되지 않고 폐기되지 않은 토큰만 반환
 */
export function getValidTokensByInvoiceId(invoiceId: string): AccessToken[] {
  const now = new Date()
  return DUMMY_TOKENS.filter(
    (token) =>
      token.invoiceId === invoiceId &&
      !token.isRevoked &&
      new Date(token.expiresAt) > now
  )
}

/**
 * 토큰 문자열로 토큰 조회
 */
export function findTokenByValue(tokenValue: string): AccessToken | undefined {
  return DUMMY_TOKENS.find((token) => token.token === tokenValue)
}
