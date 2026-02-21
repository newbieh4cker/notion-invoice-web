"use client"

/**
 * 견적서 목록 페이지네이션 컴포넌트
 * 노션 API cursor 기반 페이지네이션 UI
 * - 이전/다음 버튼
 * - 현재 페이지 번호 표시
 * - cursor를 URL 쿼리 파라미터로 관리
 */

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InvoicesPaginationProps {
  /** 현재 페이지 번호 (표시용) */
  currentPage: number
  /** 다음 페이지 존재 여부 */
  hasMore: boolean
  /** 다음 페이지 cursor 값 */
  nextCursor: string | null
}

export function InvoicesPagination({
  currentPage,
  hasMore,
  nextCursor,
}: InvoicesPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * 다음 페이지로 이동
   * URL에 page 번호와 cursor를 쿼리 파라미터로 추가
   */
  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(currentPage + 1))
    params.set("cursor", nextCursor)
    router.push(`?${params.toString()}`)
  }

  /**
   * 이전 페이지로 이동
   * 1페이지면 cursor 없이 첫 페이지 요청
   */
  const handlePrevPage = () => {
    if (currentPage <= 1) return

    const params = new URLSearchParams(searchParams.toString())
    const prevPage = currentPage - 1
    params.set("page", String(prevPage))

    // 이전 cursor 기록에서 복원 (히스토리 기반)
    // 1페이지로 돌아가면 cursor 제거 (첫 페이지 요청)
    if (prevPage === 1) {
      params.delete("cursor")
    } else {
      // 브라우저 히스토리 뒤로가기 활용
      router.back()
      return
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* 현재 페이지 정보 */}
      <p className="text-sm text-muted-foreground">
        페이지 <span className="font-medium text-foreground">{currentPage}</span>
        {hasMore && " (더 보기 가능)"}
      </p>

      {/* 이전/다음 버튼 */}
      <div className="flex items-center gap-2">
        {/* 이전 페이지 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          이전
        </Button>

        {/* 현재 페이지 번호 뱃지 */}
        <span className="flex h-8 min-w-8 items-center justify-center rounded-md border bg-muted px-2 text-sm font-medium">
          {currentPage}
        </span>

        {/* 다음 페이지 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!hasMore}
          aria-label="다음 페이지"
        >
          다음
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
