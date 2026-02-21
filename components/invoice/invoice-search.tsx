"use client"

/**
 * 견적서 검색 컴포넌트
 * 클라이언트명/견적서번호/이메일 실시간 검색
 * Zustand 스토어의 setSearchTerm과 연동
 */

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useInvoiceStore } from "@/stores/invoice-store"

export function InvoiceSearch() {
  const { searchTerm, setSearchTerm } = useInvoiceStore()

  // 검색어 초기화 핸들러
  const handleClear = () => {
    setSearchTerm("")
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      {/* 검색 아이콘 */}
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="클라이언트명, 견적서 번호, 이메일 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-9"
        aria-label="견적서 검색"
      />
      {/* 검색어 초기화 버튼 */}
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
          aria-label="검색어 지우기"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
