"use client"

/**
 * 클라이언트용 견적서 열람 컴포넌트 (읽기 전용)
 * 공유 링크로 접근한 클라이언트에게 표시
 * 관리자 상세와 유사하나 액션 버튼은 PDF 다운로드만 노출
 * 인쇄 친화적 레이아웃 지원
 */

import { FileText, Calendar, CalendarClock, Building2, User, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { PdfDownloadButton } from "@/components/invoice/pdf-download-button"
import { StatusBadge } from "@/components/invoice/status-badge"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Invoice } from "@/types/invoice"

interface InvoiceViewProps {
  /** 견적서 데이터 */
  invoice: Invoice
}

/** PDF 출력 영역 DOM ID */
const PDF_ELEMENT_ID = "client-invoice-print-area"

export function InvoiceView({ invoice }: InvoiceViewProps) {
  // PDF 파일명 생성
  const pdfFilename = `견적서_${invoice.invoiceNumber}_${invoice.clientName}.pdf`

  // 금액 계산
  const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = Math.round(subtotal * 0.1)
  const totalWithTax = subtotal + taxAmount

  return (
    <div className="space-y-6">
      {/* PDF 출력 영역 */}
      <div
        id={PDF_ELEMENT_ID}
        className="space-y-6 print:p-8 print:space-y-8"
      >
        {/* 견적서 상단 헤더 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 print:hidden">
              <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                견적서
              </h1>
              <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </div>
          {/* 상태 배지 (인쇄 시 숨김) */}
          <div className="print:hidden">
            <StatusBadge status={invoice.status} size="lg" />
          </div>
        </div>

        {/* 발행자 및 날짜 정보 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  <span>발행자</span>
                </div>
                <p className="font-semibold">{invoice.companyName}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>발행일</span>
                  </div>
                  <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    <span>유효기간</span>
                  </div>
                  <span className="font-medium">{formatDate(invoice.expiryDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 수신 클라이언트 정보 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">수신 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">이름</p>
                  <p className="text-sm font-medium">{invoice.clientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">이메일</p>
                  <p className="text-sm font-medium">{invoice.clientEmail}</p>
                </div>
              </div>
              {invoice.clientPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">전화번호</p>
                    <p className="text-sm font-medium">{invoice.clientPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 견적 항목 테이블 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">견적 내역</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">상품/서비스명</TableHead>
                    <TableHead className="hidden sm:table-cell text-right w-20">수량</TableHead>
                    <TableHead className="hidden sm:table-cell text-right w-32">단가</TableHead>
                    <TableHead className="text-right pr-6 w-32">소계</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-medium">{item.description}</p>
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

        {/* 금액 요약 */}
        <Card>
          <CardContent className="pt-6">
            <div className="ml-auto max-w-xs space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">소계</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">부가세 (10%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">합계</span>
                <span className="text-xl font-bold">
                  {formatCurrency(totalWithTax)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF 다운로드 버튼 (인쇄 시 숨김) */}
      <div className="flex justify-center print:hidden">
        <PdfDownloadButton
          targetElementId={PDF_ELEMENT_ID}
          filename={pdfFilename}
          size="lg"
          className="w-full sm:w-auto min-w-48"
        />
      </div>
    </div>
  )
}
