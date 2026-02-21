/**
 * 대시보드 통계 카드 컴포넌트
 * 전체/발송/열람/지불 견적서 수를 카드 형태로 표시
 */

import { FileText, Send, Eye, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/types/invoice"

interface StatsCardsProps {
  /** 견적서 목록 데이터 */
  invoices: Invoice[]
}

interface StatCardConfig {
  title: string
  count: number
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

export function StatsCards({ invoices }: StatsCardsProps) {
  // 상태별 견적서 수 계산
  const totalCount = invoices.length
  const sentCount = invoices.filter((inv) => inv.status === "sent").length
  const viewedCount = invoices.filter((inv) => inv.status === "viewed").length
  const paidCount = invoices.filter((inv) => inv.status === "paid").length

  // 카드 설정 배열
  const stats: StatCardConfig[] = [
    {
      title: "전체 견적서",
      count: totalCount,
      icon: FileText,
      colorClass: "text-foreground",
      bgClass: "bg-muted",
    },
    {
      title: "발송됨",
      count: sentCount,
      icon: Send,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "열람됨",
      count: viewedCount,
      icon: Eye,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "지불 완료",
      count: paidCount,
      icon: CheckCircle,
      colorClass: "text-green-600 dark:text-green-400",
      bgClass: "bg-green-50 dark:bg-green-950",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {/* 아이콘 배경 원형 영역 */}
              <div className={`rounded-full p-2 ${stat.bgClass}`}>
                <Icon
                  className={`h-4 w-4 ${stat.colorClass}`}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {stat.count.toLocaleString("ko-KR")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                전체 {totalCount}건 중 {stat.count}건
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
