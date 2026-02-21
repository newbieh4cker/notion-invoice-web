"use client"

/**
 * 공유 토큰 생성 폼 컴포넌트
 * 클라이언트 이메일과 유효기간을 입력받아 공유 링크 생성
 * React Hook Form + Zod 기반 유효성 검사
 * 서버 액션을 통한 노션 DB 연동
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createTokenAction } from "@/actions/token"
import type { AccessToken } from "@/types/token"

/** 유효기간 옵션 */
const EXPIRY_OPTIONS = [
  { value: "7", label: "7일" },
  { value: "14", label: "14일" },
  { value: "30", label: "30일 (기본)" },
  { value: "60", label: "60일" },
  { value: "90", label: "90일" },
]

/** 폼 유효성 검사 스키마 */
const createTokenSchema = z.object({
  clientEmail: z
    .string()
    .email("유효한 이메일 주소를 입력해주세요")
    .min(1, "클라이언트 이메일을 입력해주세요"),
  expiresInDays: z.string().min(1, "유효기간을 선택해주세요"),
})

type CreateTokenFormValues = z.infer<typeof createTokenSchema>

interface CreateTokenFormProps {
  /** 견적서 ID (토큰 생성 시 연결) */
  invoiceId: string
  /** 토큰 생성 완료 콜백 (생성된 링크 URL 전달) */
  onTokenCreated?: (shareUrl: string, email: string, token?: AccessToken) => void
}

export function CreateTokenForm({ invoiceId, onTokenCreated }: CreateTokenFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      clientEmail: "",
      expiresInDays: "30",
    },
  })

  // Select 컴포넌트는 register와 직접 연동 안 되므로 watch로 값 감시
  const selectedDays = watch("expiresInDays")

  // 폼 제출 핸들러
  const onSubmit = async (data: CreateTokenFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      // 서버 액션으로 노션 DB에 토큰 생성
      const result = await createTokenAction({
        invoiceId,
        clientEmail: data.clientEmail,
        expiresInDays: parseInt(data.expiresInDays, 10),
      })

      if (!result.success) {
        setServerError(result.error ?? "토큰 생성에 실패했습니다.")
        return
      }

      if (result.data) {
        onTokenCreated?.(result.data.shareUrl, data.clientEmail, result.data.token)
      }

      reset()
    } catch {
      setServerError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" aria-hidden="true" />
          공유 링크 생성
        </CardTitle>
        <CardDescription>
          클라이언트가 견적서를 열람할 수 있는 공유 링크를 생성합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* 서버 에러 표시 */}
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 클라이언트 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="clientEmail">클라이언트 이메일</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                aria-invalid={!!errors.clientEmail}
                aria-describedby={errors.clientEmail ? "email-error" : undefined}
                disabled={isLoading}
                {...register("clientEmail")}
              />
              {errors.clientEmail && (
                <p id="email-error" role="alert" className="text-sm text-destructive">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>

            {/* 유효기간 선택 */}
            <div className="space-y-2">
              <Label htmlFor="expiresInDays">유효기간</Label>
              <Select
                value={selectedDays}
                onValueChange={(value) => setValue("expiresInDays", value)}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="expiresInDays"
                  aria-invalid={!!errors.expiresInDays}
                >
                  <SelectValue placeholder="유효기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiresInDays && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.expiresInDays.message}
                </p>
              )}
            </div>
          </div>

          {/* 생성 버튼 */}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                생성 중...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                공유 링크 생성
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
