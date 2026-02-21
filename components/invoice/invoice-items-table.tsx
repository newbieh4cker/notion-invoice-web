/**
 * 견적서 항목 테이블 컴포넌트
 * 상품/서비스 항목, 수량, 단가, 소계 표시
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { InvoiceItem } from "@/types/invoice"

interface InvoiceItemsTableProps {
  /** 견적서 항목 목록 */
  items: InvoiceItem[]
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">견적 항목</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">상품/서비스명</TableHead>
                {/* 모바일에서 수량/단가 컬럼 숨김 */}
                <TableHead className="hidden sm:table-cell text-right w-20">
                  수량
                </TableHead>
                <TableHead className="hidden sm:table-cell text-right w-32">
                  단가
                </TableHead>
                <TableHead className="text-right pr-6 w-32">소계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <div>
                      {/* 항목 번호와 설명 */}
                      <p className="font-medium">{item.description}</p>
                      {/* 모바일에서 수량 x 단가 보조 표시 */}
                      <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                        {item.quantity}개 × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {item.quantity.toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right pr-6 font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
