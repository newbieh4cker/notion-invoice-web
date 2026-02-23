"use client"

/**
 * 견적서 검색 컴포넌트
 * 클라이언트명/견적서번호/이메일 검색 (300ms 디바운스 적용)
 * 타이핑 중 불필요한 필터링 방지로 성능 개선
 */

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useInvoiceStore } from "@/stores/invoice-store"

/** 검색 디바운스 지연 시간 (ms) */
const DEBOUNCE_DELAY = 300

export function InvoiceSearch() {
  const { searchTerm, setSearchTerm } = useInvoiceStore()
  const [inputValue, setInputValue] = useState(searchTerm)

  // 디바운스: inputValue가 변경되면 300ms 후 Zustand 스토어 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timer)
  }, [inputValue, setSearchTerm])

  // 검색어 초기화 핸들러
  const handleClear = () => {
    setInputValue("")
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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 pr-9"
        aria-label="견적서 검색"
      />
      {/* 검색어 초기화 버튼 */}
      {inputValue && (
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
