/**
 * 견적서 금액 요약 컴포넌트
 * 소계, 세금(10%), 총액 표시
 * 총액은 진한 글씨로 강조
 */

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/format"
import type { Invoice } from "@/types/invoice"

interface InvoiceSummaryProps {
  /** 견적서 데이터 */
  invoice: Invoice
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  // 소계 계산 (모든 항목 합산)
  const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0)
  // 세금 계산 (10%)
  const taxAmount = Math.round(subtotal * 0.1)
  // 총액 (소계 + 세금)
  const totalWithTax = subtotal + taxAmount

  return (
    <Card>
      <CardContent className="pt-6">
        {/* 금액 요약 테이블 - 오른쪽 정렬 */}
        <div className="ml-auto max-w-xs space-y-3">
          {/* 소계 */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">소계</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* 부가세 */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">부가세 (10%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>

          <Separator />

          {/* 총액 - 강조 표시 */}
          <div className="flex justify-between">
            <span className="font-semibold">총액</span>
            <span className="text-lg font-bold">
              {formatCurrency(totalWithTax)}
            </span>
          </div>

          {/* 노션 데이터의 totalAmount와 계산값이 다를 수 있어 원본 값도 표시 */}
          {invoice.totalAmount !== totalWithTax && (
            <p className="text-xs text-muted-foreground text-right">
              견적서 금액: {formatCurrency(invoice.totalAmount)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
