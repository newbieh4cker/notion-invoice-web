"use client"

/**
 * 관리자 영역 에러 바운더리
 * 관리자 페이지에서 런타임 에러 발생 시 표시됩니다.
 * Next.js App Router에서 error.tsx는 반드시 클라이언트 컴포넌트여야 합니다.
 */

import { useEffect } from "react"
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AdminErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    // 관리자 영역 에러 로깅
    console.error("[관리자 에러]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="flex justify-center">
        <Card className="w-full max-w-lg shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>관리자 페이지 오류</CardTitle>
                <CardDescription>
                  페이지를 표시하는 중 오류가 발생했습니다
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>
                요청을 처리하는 도중 예기치 않은 오류가 발생했습니다.
                노션 API 연결을 확인하거나 잠시 후 다시 시도해주세요.
              </AlertDescription>
            </Alert>

            {/* 개발 환경에서만 상세 에러 정보 표시 */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-xs font-mono">
                <p className="font-semibold text-destructive mb-2">
                  개발 환경 디버그 정보
                </p>
                <div className="space-y-1 text-muted-foreground break-all">
                  <p>
                    <span className="font-medium">메시지:</span> {error.message}
                  </p>
                  {error.digest && (
                    <p>
                      <span className="font-medium">Digest:</span> {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium text-foreground">
                        스택 트레이스 보기
                      </summary>
                      <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* 프로덕션 환경에서 에러 ID 표시 */}
            {process.env.NODE_ENV !== "development" && error.digest && (
              <p className="text-xs text-center text-muted-foreground">
                오류 ID:{" "}
                <code className="font-mono rounded bg-muted px-1 py-0.5">
                  {error.digest}
                </code>
              </p>
            )}
          </CardContent>

          <CardFooter className="flex gap-2 flex-wrap">
            <Button onClick={reset} className="gap-2 flex-1">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="gap-2 flex-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              대시보드로
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
