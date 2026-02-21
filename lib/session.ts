/**
 * 세션 관리 모듈 (서버 사이드 전용)
 * HMAC-SHA256 서명으로 세션 변조를 감지합니다.
 * 클라이언트 컴포넌트에서 import 금지
 */

import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"
import type { AdminSession } from "@/types"

/** 세션 쿠키 이름 */
const SESSION_COOKIE_NAME = "admin_session"

/** 세션 유효기간 (24시간, 초 단위) */
const SESSION_MAX_AGE = 60 * 60 * 24

/**
 * SESSION_SECRET 환경변수 가져오기
 * 미설정 시 개발 환경에서는 경고 출력, 프로덕션에서는 에러 발생
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[보안 오류] SESSION_SECRET 환경변수가 설정되지 않았습니다. " +
        "프로덕션 환경에서는 반드시 설정해야 합니다."
      )
    }
    // 개발 환경: 경고 출력 후 임시 키 사용 (보안 취약하지만 개발 편의를 위해 허용)
    console.warn(
      "[경고] SESSION_SECRET이 설정되지 않았습니다. " +
      "개발 환경에서만 허용됩니다. .env.local에 SESSION_SECRET을 설정하세요."
    )
    return "dev-only-fallback-secret-do-not-use-in-production"
  }

  if (secret.length < 32) {
    console.warn(
      "[경고] SESSION_SECRET이 32자 미만입니다. 보안 강화를 위해 더 긴 키를 사용하세요."
    )
  }

  return secret
}

/**
 * 세션 데이터를 HMAC-SHA256으로 서명하여 쿠키값 생성
 * 형식: base64(data) + "." + hmac-hex
 *
 * @param session - 서명할 세션 데이터
 * @returns 서명된 세션 문자열
 */
function signSession(session: AdminSession): string {
  const secret = getSessionSecret()
  const data = Buffer.from(JSON.stringify(session)).toString("base64")
  const signature = createHmac("sha256", secret).update(data).digest("hex")
  return `${data}.${signature}`
}

/**
 * 서명된 세션 쿠키값을 검증하고 데이터 반환
 * 타이밍 공격을 방지하기 위해 timingSafeEqual 사용
 *
 * @param cookieValue - 검증할 쿠키 값
 * @returns 검증 성공 시 세션 데이터, 실패 시 null
 */
function verifySession(cookieValue: string): AdminSession | null {
  try {
    const dotIndex = cookieValue.lastIndexOf(".")
    if (dotIndex === -1) {
      // 레거시 형식 (서명 없는 base64) - 보안 강화 후 무효 처리
      return null
    }

    const data = cookieValue.substring(0, dotIndex)
    const signature = cookieValue.substring(dotIndex + 1)

    const secret = getSessionSecret()
    const expectedSignature = createHmac("sha256", secret).update(data).digest("hex")

    // 타이밍 공격 방지: 일정 시간 비교 (timingSafeEqual)
    const signatureBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")

    // 길이가 다르면 즉시 false (timingSafeEqual은 같은 길이 요구)
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null
    }

    const isValid = timingSafeEqual(signatureBuffer, expectedBuffer)
    if (!isValid) {
      return null
    }

    // 서명 검증 성공 - 데이터 파싱
    const session = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    ) as AdminSession

    // 세션 데이터 기본 검증
    if (!session.isAuthenticated || !session.email) {
      return null
    }

    return session
  } catch {
    // 파싱 오류 또는 기타 예외 → 무효 세션
    return null
  }
}

/**
 * 관리자 세션 조회
 * 서버 컴포넌트 및 서버 액션에서 사용
 * 쿠키의 HMAC 서명을 검증하여 변조된 세션을 탐지합니다.
 *
 * @returns 유효한 세션 데이터 또는 null
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  return verifySession(sessionCookie.value)
}

/**
 * 관리자 세션 생성
 * 세션 데이터를 HMAC-SHA256으로 서명하여 쿠키에 저장합니다.
 *
 * @param email - 인증된 관리자 이메일
 */
export async function createSession(email: string): Promise<void> {
  const cookieStore = await cookies()
  const session: AdminSession = { isAuthenticated: true, email }
  const sessionValue = signSession(session)

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

/**
 * 관리자 세션 삭제 (로그아웃)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
