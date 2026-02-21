"use client"

/**
 * 대시보드 최근 견적서 테이블 컴포넌트
 * 최근 견적서 5건을 테이블 형태로 표시
 * 행 클릭 시 견적서 상세 페이지로 이동
 */

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/invoice/status-badge"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Invoice } from "@/types/invoice"
import { ArrowRight } from "lucide-react"

interface RecentInvoicesTableProps {
  /** 견적서 목록 전체 (최근 5건만 표시) */
  invoices: Invoice[]
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const router = useRouter()

  // 생성일 기준 최근 5건만 표시
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">최근 견적서</CardTitle>
        {/* 전체 보기 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/invoices")}
          className="text-sm"
        >
          전체 보기
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {recentInvoices.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            견적서가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">견적서 번호</TableHead>
                  <TableHead>클라이언트</TableHead>
                  {/* 모바일에서 금액 컬럼 숨김 */}
                  <TableHead className="hidden sm:table-cell text-right">금액</TableHead>
                  <TableHead>상태</TableHead>
                  {/* 모바일에서 발행일 컬럼 숨김 */}
                  <TableHead className="hidden md:table-cell">발행일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    role="button"
                    aria-label={`${invoice.invoiceNumber} 상세 보기`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      // 키보드 접근성 지원
                      if (e.key === "Enter" || e.key === " ") {
                        router.push(`/invoices/${invoice.id}`)
                      }
                    }}
                  >
                    <TableCell className="pl-6 font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} size="sm" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
