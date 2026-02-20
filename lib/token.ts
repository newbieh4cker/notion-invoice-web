import { randomBytes } from "crypto"

/**
 * 공유 토큰 생성
 * 암호학적으로 안전한 난수 토큰 생성
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

/**
 * 토큰 만료일 계산
 * @param expiresInDays 유효기간 (일 단위)
 */
export function calculateExpiryDate(expiresInDays: number): Date {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + expiresInDays)
  return expiryDate
}
