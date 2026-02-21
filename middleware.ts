/**
 * Next.js 미들웨어
 * Edge Runtime에서 실행되므로 Web Crypto API를 사용합니다.
 * 관리자 페이지 접근 제어 및 세션 HMAC 서명 검증
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { AdminSession } from "@/types/auth"

/** 세션 쿠키 이름 (lib/session.ts와 동일) */
const SESSION_COOKIE_NAME = "admin_session"

/**
 * Web Crypto API를 사용한 HMAC-SHA256 서명 검증
 * Edge Runtime에서는 Node.js crypto 모듈을 사용할 수 없으므로
 * Web Crypto API (SubtleCrypto)를 사용합니다.
 *
 * @param data - 검증할 데이터 문자열
 * @param signature - 검증할 서명 (hex 문자열)
 * @param secret - HMAC 비밀키
 * @returns 서명 유효 여부
 */
async function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()

    // HMAC 키 임포트
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    // 동일한 데이터로 서명 재계산
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data)
    )

    // hex 문자열로 변환
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // 상수 시간 비교 (타이밍 공격 방지)
    if (signature.length !== expectedSignature.length) {
      return false
    }

    let mismatch = 0
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    return mismatch === 0
  } catch {
    return false
  }
}

/**
 * 쿠키에서 세션 정보 추출 및 HMAC 검증
 * middleware에서는 next/headers의 cookies()를 사용할 수 없으므로
 * NextRequest.cookies를 직접 사용
 *
 * @param request - NextRequest 객체
 * @returns 유효한 세션 또는 null
 */
async function getSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  const cookieValue = sessionCookie.value

  // 서명이 없는 레거시 형식 거부 (보안 강화)
  const dotIndex = cookieValue.lastIndexOf(".")
  if (dotIndex === -1) {
    return null
  }

  const data = cookieValue.substring(0, dotIndex)
  const signature = cookieValue.substring(dotIndex + 1)

  const secret =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "dev-only-fallback-secret-do-not-use-in-production"
      : null)

  if (!secret) {
    console.error("[미들웨어] SESSION_SECRET이 설정되지 않았습니다.")
    return null
  }

  // HMAC 서명 검증
  const isValidSignature = await verifyHmacSignature(data, signature, secret)
  if (!isValidSignature) {
    return null
  }

  try {
    const session = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    ) as AdminSession

    if (!session.isAuthenticated || !session.email) {
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Next.js 미들웨어
 * 관리자 라우트 보호 및 로그인 페이지 리다이렉트 처리
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getSessionFromRequest(request)

  // 관리자 라우트 보호: 미인증 시 로그인 페이지로 리다이렉트
  // (admin) 라우트 그룹의 실제 경로는 /dashboard, /invoices 등
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/invoices")

  if (isAdminRoute && !session) {
    const loginUrl = new URL("/login", request.url)
    // 원래 접근하려던 URL을 쿼리 파라미터로 전달 (로그인 후 리다이렉트용)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 로그인 페이지 보호: 이미 인증된 사용자는 대시보드로 리다이렉트
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/login",
  ],
}
