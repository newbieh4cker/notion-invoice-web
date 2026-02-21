import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { AdminSession } from "@/types/auth"

/** 세션 쿠키 이름 (lib/session.ts와 동일) */
const SESSION_COOKIE_NAME = "admin_session"

/**
 * 쿠키에서 세션 정보 추출
 * middleware에서는 next/headers의 cookies()를 사용할 수 없으므로
 * NextRequest.cookies를 직접 사용
 */
function getSessionFromRequest(request: NextRequest): AdminSession | null {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
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
 * 관리자 페이지 접근 제어 및 인증 리다이렉트 처리
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionFromRequest(request)

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
