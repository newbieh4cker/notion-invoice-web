import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "로그인 | 견적서 관리",
  description: "관리자 로그인 페이지",
}

/**
 * 관리자 로그인 페이지 (F010)
 * - LoginForm 컴포넌트를 중앙 정렬 레이아웃으로 표시
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
