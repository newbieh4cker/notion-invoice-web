"use client"

/**
 * 날짜 범위 필터 컴포넌트
 * shadcn/ui Calendar + Popover 기반
 * 시작일과 종료일을 선택하여 발행일 범위 필터링
 */

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useInvoiceStore } from "@/stores/invoice-store"
import { cn } from "@/lib/utils"

export function DateRangeFilter() {
  const { filter, setFilter } = useInvoiceStore()
  const [isOpen, setIsOpen] = useState(false)

  // 시작일, 종료일 파싱
  const fromDate = filter.dateRange.from
    ? new Date(filter.dateRange.from)
    : undefined
  const toDate = filter.dateRange.to
    ? new Date(filter.dateRange.to)
    : undefined

  // 날짜 선택 핸들러
  const handleDateSelect = (type: "from" | "to", date: Date | undefined) => {
    if (!date) return

    const dateStr = date.toISOString().split("T")[0]

    if (type === "from") {
      setFilter({
        dateRange: {
          ...filter.dateRange,
          from: dateStr,
          // from이 to보다 크면 to 초기화
          to:
            filter.dateRange.to &&
            dateStr > filter.dateRange.to
              ? null
              : filter.dateRange.to,
        },
      })
    } else {
      setFilter({
        dateRange: {
          ...filter.dateRange,
          to: dateStr,
        },
      })
    }
  }

  // 필터 초기화
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFilter({
      dateRange: {
        from: null,
        to: null,
      },
    })
  }

  // 날짜 범위 표시 텍스트
  const displayText =
    fromDate && toDate
      ? `${format(fromDate, "MMM dd", { locale: ko })} - ${format(toDate, "MMM dd", { locale: ko })}`
      : fromDate
        ? `${format(fromDate, "MMM dd", { locale: ko })} -`
        : "발행일"

  const hasFilter = filter.dateRange.from || filter.dateRange.to

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
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{displayText}</span>
          {hasFilter && (
            <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              ✓
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="space-y-4">
            {/* 시작일 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">시작일</label>
              <CalendarComponent
                mode="single"
                selected={fromDate}
                onSelect={(date) => handleDateSelect("from", date)}
                disabled={(date) =>
                  toDate ? date > toDate : false
                }
              />
            </div>

            {/* 종료일 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">종료일</label>
              <CalendarComponent
                mode="single"
                selected={toDate}
                onSelect={(date) => handleDateSelect("to", date)}
                disabled={(date) =>
                  fromDate ? date < fromDate : false
                }
              />
            </div>

            {/* 버튼 영역 */}
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
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                적용
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
