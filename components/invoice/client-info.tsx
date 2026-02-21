/**
 * 클라이언트 정보 카드 컴포넌트
 * 견적서 수신 클라이언트의 상세 정보 표시
 */

import { User, Mail, Phone, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/types/invoice"

interface ClientInfoProps {
  /** 견적서 데이터 (클라이언트 정보 포함) */
  invoice: Invoice
}

/** 정보 항목 표시를 위한 공통 컴포넌트 */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

export function ClientInfo({ invoice }: ClientInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">수신 클라이언트 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 클라이언트명 */}
          <InfoRow
            icon={User}
            label="클라이언트명"
            value={invoice.clientName}
          />
          {/* 이메일 */}
          <InfoRow
            icon={Mail}
            label="이메일"
            value={invoice.clientEmail}
          />
          {/* 전화번호 */}
          {invoice.clientPhone && (
            <InfoRow
              icon={Phone}
              label="전화번호"
              value={invoice.clientPhone}
            />
          )}
          {/* 발행 회사 */}
          <InfoRow
            icon={Building2}
            label="발행자"
            value={invoice.companyName}
          />
        </div>
      </CardContent>
    </Card>
  )
}
