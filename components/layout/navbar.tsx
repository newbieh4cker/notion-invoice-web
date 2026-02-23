"use client"

/**
 * 관리자 네비게이션 바 컴포넌트
 * - 현재 페이지 활성 메뉴 하이라이트 (usePathname)
 * - 모바일 반응형 메뉴 (Sheet + Menu 아이콘)
 * - 로그아웃 버튼 (logoutAction 연동)
 * - 테마 토글 포함
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  FileStack,
  Menu,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "./theme-toggle"
import { Breadcrumb } from "./breadcrumb"
import { logoutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"

/** 네비게이션 메뉴 구성 */
const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/invoices",
    label: "견적서",
    icon: FileStack,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  /**
   * 현재 경로가 해당 메뉴 항목과 일치하는지 확인
   * /invoices 메뉴는 /invoices/* 하위 경로도 활성화
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-col max-w-screen-2xl">
        {/* 메인 네비게이션 바 */}
        <div className="flex h-14 items-center px-4">
        {/* 로고 영역 */}
        <div className="mr-4 flex items-center">
          <Link
            href="/dashboard"
            className="mr-6 flex items-center space-x-2"
            aria-label="대시보드로 이동"
          >
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="hidden font-bold sm:inline-block">
              견적서 관리
            </span>
          </Link>

          {/* 데스크탑 네비게이션 메뉴 */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="주요 메뉴"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 오른쪽 영역 */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* 테마 토글 */}
          <ThemeToggle />

          {/* 데스크탑 로그아웃 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>로그아웃</span>
          </Button>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0"
                aria-label="메뉴 열기"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>

            {/* 모바일 사이드 메뉴 */}
            <SheetContent side="right" className="w-64">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  견적서 관리
                </SheetTitle>
              </SheetHeader>

              <Separator className="my-4" />

              {/* 모바일 네비게이션 메뉴 */}
              <nav
                className="flex flex-col gap-1"
                aria-label="모바일 메뉴"
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <Separator className="my-4" />

              {/* 모바일 로그아웃 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground px-3"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                로그아웃
              </Button>
            </SheetContent>
          </Sheet>
        </div>
        </div>

        {/* 브레드크럼 네비게이션 */}
        <div className="border-t border-border/40 bg-muted/30">
          <Breadcrumb />
        </div>
      </div>
    </header>
  )
}
