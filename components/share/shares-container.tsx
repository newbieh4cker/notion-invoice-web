"use client"

/**
 * 공유 링크 관리 페이지 클라이언트 컨테이너
 * 토큰 생성 폼, 생성된 링크 표시, 토큰 목록을 통합 관리
 * 서버 액션을 통한 노션 DB 연동
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreateTokenForm } from "@/components/share/create-token-form"
import { ShareLinkDisplay } from "@/components/share/share-link-display"
import { TokenList } from "@/components/share/token-list"
import { useTokenStore } from "@/stores/token-store"
import { revokeTokenAction } from "@/actions/token"
import type { AccessToken } from "@/types/token"

interface SharesContainerProps {
  /** 견적서 ID */
  invoiceId: string
  /** 견적서 번호 (표시용) */
  invoiceNumber: string
  /** 초기 토큰 목록 */
  initialTokens: AccessToken[]
}

export function SharesContainer({
  invoiceId,
  invoiceNumber,
  initialTokens,
}: SharesContainerProps) {
  const router = useRouter()
  const { tokens, setTokens, addToken, revokeToken } = useTokenStore()

  // 새로 생성된 공유 링크 상태
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null)
  const [newShareEmail, setNewShareEmail] = useState<string | null>(null)

  // 컴포넌트 마운트 시 스토어에 초기 데이터 적재
  useEffect(() => {
    setTokens(initialTokens)
  }, [initialTokens, setTokens])

  // 현재 견적서의 모든 토큰 필터링
  const invoiceTokens = tokens.filter((tok) => tok.invoiceId === invoiceId)

  // 기본 URL (클라이언트 사이드에서 현재 origin 사용)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  // 토큰 생성 완료 콜백
  const handleTokenCreated = (shareUrl: string, email: string, token?: AccessToken) => {
    setNewShareUrl(shareUrl)
    setNewShareEmail(email)

    // 생성된 토큰을 스토어에 추가
    if (token) {
      addToken(token)
    }
  }

  // 토큰 무효화 핸들러
  const handleRevoke = async (tokenId: string) => {
    // 서버 액션으로 노션 DB에서 토큰 무효화
    const result = await revokeTokenAction(tokenId)

    if (result.success) {
      // 성공 시 스토어에서도 업데이트
      revokeToken(tokenId)
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className="-ml-2 mb-2"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            견적서로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            공유 링크 관리
          </h1>
          <p className="mt-1 text-muted-foreground">
            견적서 <span className="font-medium text-foreground">{invoiceNumber}</span>
            의 공유 링크를 관리합니다.
          </p>
        </div>
      </div>

      <Separator />

      {/* 공유 링크 생성 폼 */}
      <CreateTokenForm
        invoiceId={invoiceId}
        onTokenCreated={handleTokenCreated}
      />

      {/* 새로 생성된 공유 링크 표시 */}
      {newShareUrl && (
        <ShareLinkDisplay
          shareUrl={newShareUrl}
          recipientEmail={newShareEmail ?? undefined}
        />
      )}

      {/* 토큰 목록 */}
      <TokenList
        tokens={invoiceTokens}
        baseUrl={baseUrl}
        onRevoke={handleRevoke}
      />
    </div>
  )
}
