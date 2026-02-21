"use client"

/**
 * 전역 에러 바운더리
 * 런타임 에러 발생 시 사용자 친화적인 에러 페이지를 표시합니다.
 * Next.js App Router에서 error.tsx는 반드시 클라이언트 컴포넌트여야 합니다.
 */

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송 가능)
    console.error("[전역 에러]", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">오류가 발생했습니다</CardTitle>
          <CardDescription>
            요청을 처리하는 중에 예기치 않은 오류가 발생했습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 사용자 안내 메시지 */}
          <p className="text-sm text-muted-foreground text-center">
            일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.
          </p>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-3 text-xs font-mono break-all">
              <p className="font-semibold text-destructive mb-1">개발 환경 디버그 정보:</p>
              <p className="text-muted-foreground">{error.message}</p>
              {error.digest && (
                <p className="text-muted-foreground mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 프로덕션에서는 에러 ID만 표시 */}
          {process.env.NODE_ENV !== "development" && error.digest && (
            <div className="rounded-md bg-muted p-3 text-xs text-center">
              <span className="text-muted-foreground">
                오류 코드: <code className="font-mono">{error.digest}</code>
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          <Button variant="default" onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
