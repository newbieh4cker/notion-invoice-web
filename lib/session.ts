import { cookies } from "next/headers"
import type { AdminSession } from "@/types"

const SESSION_COOKIE_NAME = "admin_session"
const SESSION_MAX_AGE = 60 * 60 * 24 // 24시간 (초 단위)

/**
 * 관리자 세션 조회
 * 서버 컴포넌트 및 서버 액션에서 사용
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    ) as AdminSession
    return session
  } catch {
    return null
  }
}

/**
 * 관리자 세션 생성
 */
export async function createSession(email: string): Promise<void> {
  const cookieStore = await cookies()
  const session: AdminSession = { isAuthenticated: true, email }
  const sessionValue = Buffer.from(JSON.stringify(session)).toString("base64")

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
