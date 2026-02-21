import { Metadata } from "next"
import { InvoiceView } from "@/components/invoice/invoice-view"
import { ErrorState } from "@/components/common/error-state"
import { validateAccessToken, getInvoiceById, updateInvoiceStatus } from "@/lib/notion"
import { formatCurrency } from "@/lib/format"

/**
 * 클라이언트 견적서 열람 페이지 캐시 설정
 * revalidate: 0 = 캐시 없음
 * 이유: 토큰 검증, 마지막 접근일 업데이트, 상태 변경(sent→viewed) 등
 * 동적 작업이 매 요청마다 실행되어야 함
 */
export const revalidate = 0

interface ClientInvoicePageProps {
  params: Promise<{ token: string }>
}

/**
 * 동적 메타데이터 생성 (SEO 최적화)
 * 견적서 번호, 클라이언트명, 금액을 OG 태그에 포함
 */
export async function generateMetadata({
  params,
}: ClientInvoicePageProps): Promise<Metadata> {
  const { token } = await params

  try {
    // 토큰 유효성 검증
    const validation = await validateAccessToken(token)

    // 토큰이 유효하지 않으면 기본 메타데이터 반환
    if (!validation.isValid || !validation.invoiceId) {
      return {
        title: "견적서 열람",
        description: "공유받은 견적서를 확인하세요",
        robots: { index: false, follow: false },
      }
    }

    // 견적서 조회
    const invoice = await getInvoiceById(validation.invoiceId)

    if (!invoice) {
      return {
        title: "견적서 열람",
        description: "공유받은 견적서를 확인하세요",
        robots: { index: false, follow: false },
      }
    }

    // 견적서 정보로 OG 메타데이터 생성
    const title = `${invoice.invoiceNumber} | ${invoice.clientName} | ${formatCurrency(invoice.totalAmount)}`
    const description = `${invoice.companyName}에서 발송한 견적서입니다. 견적번호: ${invoice.invoiceNumber}, 금액: ${formatCurrency(invoice.totalAmount)}`

    return {
      title,
      description,
      // 검색엔진 인덱싱 금지 (민감한 비즈니스 문서)
      robots: { index: false, follow: false },
      openGraph: {
        title,
        description,
        type: "website",
        locale: "ko_KR",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    }
  } catch {
    return {
      title: "견적서 열람",
      description: "공유받은 견적서를 확인하세요",
      robots: { index: false, follow: false },
    }
  }
}

/**
 * 클라이언트 견적서 열람 페이지 (F003, F004, F011)
 * - 노션 API를 통한 토큰 유효성 검증
 * - 유효한 토큰이면 견적서 데이터 조회 후 InvoiceView 렌더링
 * - 유효하지 않은 토큰이면 ErrorState 표시
 */
export default async function ClientInvoicePage({
  params,
}: ClientInvoicePageProps) {
  const { token } = await params

  // 토큰 유효성 검증 (3단계: 존재 -> 폐기 -> 만료)
  const validation = await validateAccessToken(token)

  // 토큰이 유효하지 않은 경우
  if (!validation.isValid) {
    const errorMessages: Record<string, { title: string; description: string }> = {
      not_found: {
        title: "유효하지 않은 링크",
        description: "요청하신 견적서 링크가 올바르지 않습니다. 발송된 링크를 다시 확인해주세요.",
      },
      invalid: {
        title: "비활성화된 링크",
        description: "이 견적서 링크가 비활성화되었습니다. 발신자에게 문의해주세요.",
      },
      expired: {
        title: "만료된 링크",
        description: "이 견적서 링크의 유효기간이 만료되었습니다. 새 링크를 요청해주세요.",
      },
    }

    const error = errorMessages[validation.reason ?? "not_found"]

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title={error.title}
            description={error.description}
          />
        </div>
      </div>
    )
  }

  // 견적서 조회
  const invoice = await getInvoiceById(validation.invoiceId!)

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <ErrorState
            title="견적서를 찾을 수 없습니다"
            description="요청하신 견적서 정보를 찾을 수 없습니다. 발신자에게 문의해주세요."
          />
        </div>
      </div>
    )
  }

  // 견적서 상태 자동 변경: sent → viewed (백그라운드, 에러 무시)
  if (invoice.status === "sent") {
    updateInvoiceStatus(invoice.id, "viewed").catch(() => {
      console.warn("견적서 상태 업데이트 실패 (자동 무시)")
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 인쇄 친화적 레이아웃 */}
      <div className="container mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0">
        {/* 클라이언트 안내 헤더 (인쇄 시 숨김) */}
        <div className="mb-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground print:hidden">
          <p>
            이 견적서는 <strong className="text-foreground">{validation.token?.clientEmail}</strong>
            님께 발송된 견적서입니다.
            PDF 다운로드 버튼을 이용해 저장할 수 있습니다.
          </p>
        </div>

        {/* 견적서 뷰 컴포넌트 */}
        <InvoiceView invoice={invoice} />
      </div>
    </div>
  )
}
