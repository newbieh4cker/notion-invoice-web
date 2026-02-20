"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSession, deleteSession } from "@/lib/session"

/** 로그인 폼 유효성 검사 스키마 */
const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

/**
 * 관리자 로그인 서버 액션 (F010)
 */
export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validation = loginSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false as const,
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validation.data

  // 환경변수 기반 관리자 인증
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (email !== adminEmail || password !== adminPassword) {
    return {
      success: false as const,
      errors: { general: "이메일 또는 비밀번호가 올바르지 않습니다" },
    }
  }

  await createSession(email)
  redirect("/dashboard")
}

/**
 * 관리자 로그아웃 서버 액션
 */
export async function logoutAction() {
  await deleteSession()
  redirect("/login")
}
