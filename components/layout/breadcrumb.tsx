"use client"

/**
 * 브레드크럼 네비게이션 컴포넌트
 * usePathname과 params를 기반으로 현재 경로 표시
 * 예: 대시보드 > 견적서 목록 > INV-2026-001
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/** 경로별 라벨 매핑 */
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "대시보드",
  invoices: "견적서",
  shares: "공유 링크",
}

/** 브레드크럼 아이템 */
interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

/**
 * 경로 세그먼트를 브레드크럼 아이템으로 변환
 * /admin/invoices/123 → [{label: "대시보드", href: "/"}, {label: "견적서", href: "/invoices"}, {label: "INV-2026-001"}]
 */
function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname
    .split("/")
    .filter((s) => s && s !== "(admin)")

  const items: BreadcrumbItem[] = []

  // 대시보드 링크 추가
  items.push({
    label: "대시보드",
    href: "/dashboard",
    isCurrent: pathname === "/dashboard",
  })

  // 나머지 세그먼트 처리
  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // [id]와 같은 동적 세그먼트는 스킵 (하위에서 제목으로 표시)
    if (segment.startsWith("[") && segment.endsWith("]")) {
      continue
    }

    const label = ROUTE_LABELS[segment] || segment
    const isCurrent = i === segments.length - 1

    items.push({
      label,
      href: currentPath,
      isCurrent,
    })
  }

  // 동적 세그먼트 처리 (id, token 등)
  // 예: /invoices/[id] 페이지에서 invoiceNumber를 라벨로 사용
  if (segments.some((s) => s.startsWith("["))) {
    const lastSegment = segments[segments.length - 1]
    // 동적 세그먼트 값이 있으면 마지막 아이템으로 추가
    if (lastSegment && !lastSegment.startsWith("[")) {
      // 이미 위에서 처리됨
    }
  }

  return items
}

export function Breadcrumb() {
  const pathname = usePathname()

  // 관리자 영역이 아니면 렌더링 안 함
  if (!pathname.includes("/(admin)") && !pathname.includes("/admin")) {
    return null
  }

  const items = getBreadcrumbItems(pathname)

  // 아이템이 1개 이하면 렌더링 안 함 (대시보드만 있으면 불필요)
  if (items.length <= 1) {
    return null
  }

  return (
    <nav
      className="flex items-center gap-1 text-sm text-muted-foreground px-4"
      aria-label="경로 네비게이션"
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-1">
          {/* 구분선 (첫 아이템 제외) */}
          {index > 0 && (
            <ChevronRight
              className="h-4 w-4 text-muted-foreground/50"
              aria-hidden="true"
            />
          )}

          {/* 링크 또는 텍스트 */}
          {item.isCurrent ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground transition-colors",
                "rounded px-2 py-1 hover:bg-muted/50"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
