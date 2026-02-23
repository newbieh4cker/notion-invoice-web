"use client"

/**
 * 데스크탑 사이드바 네비게이션 컴포넌트 (선택적)
 * - 데스크탑 화면에서 토글 가능한 사이드바
 * - 주요 네비게이션 메뉴 제공
 * - Sheet 컴포넌트 기반 (모바일 미사용)
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileStack,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/** 사이드바 메뉴 항목 */
interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/invoices",
    label: "견적서 관리",
    icon: FileStack,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  /**
   * 현재 경로가 해당 메뉴 항목과 일치하는지 확인
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* 사이드바 토글 버튼 (데스크탑 전용) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex fixed left-4 bottom-4 h-10 w-10 p-0 gap-2 z-40"
        aria-label="사이드바 열기"
        title="사이드바 열기"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* 사이드바 콘텐츠 */}
      <SheetContent
        side="left"
        className="w-64 p-0 flex flex-col"
      >
        <SheetHeader className="border-b border-border/40 px-4 py-4">
          <SheetTitle className="text-left">관리자 메뉴</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="사이드바 메뉴">
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 푸터 - 사이드바 닫기 버튼 */}
        <Separator className="my-0" />
        <div className="px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-full justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            닫기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
