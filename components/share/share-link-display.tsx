"use client"

/**
 * 생성된 공유 링크 표시 컴포넌트
 * 공유 링크를 회색 박스에 표시하고 복사 버튼 제공
 * 복사 성공 시 성공 메시지 표시
 */

import { Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

interface ShareLinkDisplayProps {
  /** 표시할 공유 링크 URL */
  shareUrl: string
  /** 수신자 이메일 (안내 텍스트용) */
  recipientEmail?: string
}

export function ShareLinkDisplay({ shareUrl, recipientEmail }: ShareLinkDisplayProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()

  // 링크 복사 핸들러
  const handleCopy = async () => {
    await copyToClipboard(shareUrl)
    toast.success("링크가 클립보드에 복사되었습니다", {
      description: "클라이언트와 공유할 준비가 완료되었습니다.",
    })
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" aria-hidden="true" />
          공유 링크가 생성되었습니다
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 수신자 이메일 안내 */}
        {recipientEmail && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{recipientEmail}</span>
            에게 아래 링크를 공유하세요.
          </p>
        )}

        {/* 공유 링크 표시 영역 */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-md bg-background border border-border px-3 py-2 font-mono text-sm overflow-x-auto whitespace-nowrap"
            role="textbox"
            aria-readonly="true"
            aria-label="공유 링크"
          >
            {shareUrl}
          </div>

          {/* 링크 복사 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-shrink-0"
            aria-label={copied ? "복사됨" : "링크 복사"}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                <span className="ml-1.5 text-green-600">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span className="ml-1.5">복사</span>
              </>
            )}
          </Button>
        </div>

        {/* 새 탭에서 열기 링크 */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          새 탭에서 미리보기
        </a>
      </CardContent>
    </Card>
  )
}
