"use client"

/**
 * 관리자 로그인 폼 컴포넌트 (F010)
 * React Hook Form + Zod 기반 유효성 검사
 * 서버 액션과 연동하여 인증 처리
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAction } from "@/actions/auth"

/** 로그인 폼 유효성 검사 스키마 */
const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  // 비밀번호 가시성 상태
  const [showPassword, setShowPassword] = useState(false)
  // 서버 액션 에러 메시지 상태
  const [serverError, setServerError] = useState<string | null>(null)
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 폼 제출 핸들러
  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    setIsLoading(true)

    try {
      // FormData 생성 후 서버 액션 호출
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await loginAction(formData)

      // 서버 액션에서 오류 반환 시 처리
      if (result && !result.success) {
        const generalError = (result.errors as Record<string, string>)?.general
        setServerError(generalError ?? "로그인에 실패했습니다. 다시 시도해주세요.")
      }
    } catch {
      // 예기치 못한 오류 처리 (redirect는 throw 되므로 정상 동작)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="space-y-1 pb-6">
        {/* 로고 및 타이틀 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold tracking-tight">
            견적서 관리
          </CardTitle>
        </div>
        <CardDescription className="text-center">
          관리자 계정으로 로그인하세요
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* 서버 에러 메시지 표시 영역 */}
          {serverError && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20"
            >
              {serverError}
            </div>
          )}

          {/* 이메일 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isLoading}
              {...register("email")}
            />
            {/* 이메일 에러 메시지 */}
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isLoading}
                className="pr-10"
                {...register("password")}
              />
              {/* 비밀번호 가시성 토글 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시하기"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* 비밀번호 에러 메시지 */}
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
