"use client"

/**
 * 공유 토큰 목록 테이블 컴포넌트
 * 특정 견적서에 연결된 모든 공유 토큰 표시
 * 이메일, 토큰(마스킹), 생성일, 만료일, 마지막 접근일, 상태, 액션
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/common/empty-state"
import { TokenActions } from "@/components/share/token-actions"
import { formatDate } from "@/lib/format"
import type { AccessToken } from "@/types/token"
import { Link2Off } from "lucide-react"

interface TokenListProps {
  /** 토큰 목록 */
  tokens: AccessToken[]
  /** 기본 URL (공유 링크 생성용) */
  baseUrl: string
  /** 무효화 콜백 */
  onRevoke?: (tokenId: string) => void
}

/**
 * 토큰 문자열 마스킹 함수
 * 앞 6자리 + *** + 뒤 4자리 형식으로 표시
 */
function maskToken(token: string): string {
  if (token.length <= 10) return "***"
  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

/**
 * 토큰 상태 뱃지 컴포넌트
 */
function TokenStatusBadge({ token }: { token: AccessToken }) {
  const isExpired = new Date(token.expiresAt) < new Date()

  if (token.isRevoked) {
    return (
      <Badge variant="outline" className="text-destructive border-destructive/30">
        무효화됨
      </Badge>
    )
  }
  if (isExpired) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        만료됨
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-green-600 border-green-600/30">
      유효
    </Badge>
  )
}

export function TokenList({ tokens, baseUrl, onRevoke }: TokenListProps) {
  if (tokens.length === 0) {
    return (
      <EmptyState
        icon={Link2Off}
        title="공유 링크가 없습니다"
        description="위에서 새 공유 링크를 생성해주세요."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          공유 링크 목록
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({tokens.length}건)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">이메일</TableHead>
                {/* 모바일에서 토큰 컬럼 숨김 */}
                <TableHead className="hidden lg:table-cell font-mono">토큰</TableHead>
                {/* 태블릿 이상에서 날짜 표시 */}
                <TableHead className="hidden md:table-cell">생성일</TableHead>
                <TableHead className="hidden md:table-cell">만료일</TableHead>
                <TableHead className="hidden lg:table-cell">마지막 접근</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right pr-4">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => {
                const shareUrl = `${baseUrl}/invoice/${token.token}`
                return (
                  <TableRow key={token.id}>
                    <TableCell className="pl-6">
                      <div>
                        <p className="text-sm font-medium">{token.clientEmail}</p>
                        {/* 모바일에서 만료일 보조 표시 */}
                        <p className="text-xs text-muted-foreground md:hidden">
                          만료: {formatDate(token.expiresAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                      {maskToken(token.token)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(token.createdAt)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {formatDate(token.expiresAt)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {token.lastAccessedAt
                        ? formatDate(token.lastAccessedAt)
                        : "미열람"}
                    </TableCell>
                    <TableCell>
                      <TokenStatusBadge token={token} />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <TokenActions
                        token={token}
                        shareUrl={shareUrl}
                        onRevoke={onRevoke}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
