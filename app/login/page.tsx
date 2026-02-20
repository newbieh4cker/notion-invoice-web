import { Metadata } from "next"

export const metadata: Metadata = {
  title: "로그인 | 견적서 관리",
  description: "관리자 로그인 페이지",
}

/**
 * 관리자 로그인 페이지 (F010)
 * - 이메일/비밀번호 입력 및 서버 액션으로 인증 처리
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">견적서 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            관리자 계정으로 로그인하세요
          </p>
        </div>
        {/* TODO: LoginForm 컴포넌트로 교체 */}
        <p className="text-center text-sm text-muted-foreground">
          로그인 폼 구현 예정
        </p>
      </div>
    </div>
  )
}
