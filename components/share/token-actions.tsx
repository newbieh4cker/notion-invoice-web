"use client"

/**
 * 토큰 개별 액션 컴포넌트
 * 복사 버튼과 무효화 버튼을 Tooltip과 함께 제공
 * 무효화 시 Dialog 확인창 표시
 */

import { useState } from "react"
import { Copy, Check, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { AccessToken } from "@/types/token"

interface TokenActionsProps {
  /** 액션 대상 토큰 */
  token: AccessToken
  /** 공유 링크 전체 URL (복사용) */
  shareUrl: string
  /** 무효화 완료 콜백 */
  onRevoke?: (tokenId: string) => void
}

export function TokenActions({ token, shareUrl, onRevoke }: TokenActionsProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [isRevoking, setIsRevoking] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 이미 무효화된 토큰인지 확인
  const isRevoked = token.isRevoked
  const isExpired = new Date(token.expiresAt) < new Date()
  const isDisabled = isRevoked || isExpired

  // 무효화 확인 핸들러
  const handleRevoke = async () => {
    setIsRevoking(true)
    try {
      // TODO: Phase 3에서 실제 서버 액션 연동
      onRevoke?.(token.id)
      setDialogOpen(false)
    } catch {
      // TODO: 에러 처리
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* 링크 복사 버튼 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(shareUrl)}
            disabled={isDisabled}
            aria-label="공유 링크 복사"
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDisabled ? "사용 불가한 링크" : copied ? "복사됨!" : "공유 링크 복사"}
        </TooltipContent>
      </Tooltip>

      {/* 무효화 버튼 (이미 무효화/만료된 경우 비활성) */}
      {!isRevoked && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isExpired}
                  aria-label="토큰 무효화"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Ban className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {isExpired ? "이미 만료된 링크" : "링크 무효화"}
            </TooltipContent>
          </Tooltip>

          {/* 무효화 확인 다이얼로그 */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>공유 링크 무효화</DialogTitle>
              <DialogDescription>
                이 공유 링크를 무효화하면 클라이언트가 더 이상 견적서에 접근할 수
                없습니다. 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="text-muted-foreground">대상 이메일</p>
              <p className="font-medium">{token.clientEmail}</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isRevoking}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevoke}
                disabled={isRevoking}
                aria-busy={isRevoking}
              >
                {isRevoking ? "무효화 중..." : "무효화 확인"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
