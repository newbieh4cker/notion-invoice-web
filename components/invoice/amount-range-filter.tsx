"use client"

/**
 * 금액 범위 필터 컴포넌트
 * 최소 금액과 최대 금액을 입력하여 견적서 필터링
 */

import { useState, useCallback } from "react"
import { DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useInvoiceStore } from "@/stores/invoice-store"
import { cn } from "@/lib/utils"

export function AmountRangeFilter() {
  const { filter, setFilter } = useInvoiceStore()
  const [isOpen, setIsOpen] = useState(false)
  const [tempMin, setTempMin] = useState(
    filter.amountRange.min?.toString() || ""
  )
  const [tempMax, setTempMax] = useState(
    filter.amountRange.max?.toString() || ""
  )

  // 금액 포맷팅
  const formatAmount = (num: number | null) => {
    if (num === null) return ""
    return (num / 10000).toFixed(0)
  }

  // 임시값에서 실제값으로 변환 (만원 단위)
  const applyFilter = useCallback(() => {
    const min = tempMin ? parseInt(tempMin) * 10000 : null
    const max = tempMax ? parseInt(tempMax) * 10000 : null

    // 유효성 검사
    if (min !== null && max !== null && min > max) {
      alert("최소 금액이 최대 금액보다 클 수 없습니다.")
      return
    }

    setFilter({
      amountRange: {
        min,
        max,
      },
    })
    setIsOpen(false)
  }, [tempMin, tempMax, setFilter])

  // 필터 초기화
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTempMin("")
    setTempMax("")
    setFilter({
      amountRange: {
        min: null,
        max: null,
      },
    })
  }

  // 범위 표시 텍스트
  const displayText =
    filter.amountRange.min && filter.amountRange.max
      ? `${formatAmount(filter.amountRange.min)} - ${formatAmount(filter.amountRange.max)}만원`
      : filter.amountRange.min
        ? `${formatAmount(filter.amountRange.min)}만원 이상`
        : filter.amountRange.max
          ? `${formatAmount(filter.amountRange.max)}만원 이하`
          : "금액"

  const hasFilter =
    filter.amountRange.min !== null || filter.amountRange.max !== null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            hasFilter && "border-primary text-primary"
          )}
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{displayText}</span>
          {hasFilter && (
            <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              ✓
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="min-amount" className="text-sm font-medium">
              최소 금액 (만원)
            </label>
            <Input
              id="min-amount"
              type="number"
              placeholder="0"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="max-amount" className="text-sm font-medium">
              최대 금액 (만원)
            </label>
            <Input
              id="max-amount"
              type="number"
              placeholder="10000"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
              disabled={!hasFilter}
            >
              <X className="h-4 w-4 mr-1" />
              초기화
            </Button>
            <Button
              size="sm"
              onClick={applyFilter}
              className="flex-1"
            >
              적용
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
