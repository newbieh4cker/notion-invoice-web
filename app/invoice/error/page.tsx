import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "링크 오류 | 견적서",
  description: "공유 링크가 만료되었거나 유효하지 않습니다",
}

interface ErrorPageProps {
  searchParams: Promise<{ reason?: string }>
}

/**
 * 토큰 오류 페이지 (F011)
 * - 만료된 토큰, 무효한 토큰, 존재하지 않는 토큰 처리
 * - reason 쿼리 파라미터: expired | invalid | not_found
 */
export default async function InvoiceErrorPage({ searchParams }: ErrorPageProps) {
  const { reason } = await searchParams

  const errorMessages: Record<string, { title: string; description: string }> = {
    expired: {
      title: "공유 링크가 만료되었습니다",
      description: "이 견적서 링크의 유효기간이 지났습니다. 견적서 담당자에게 새로운 링크를 요청해주세요.",
    },
    invalid: {
      title: "유효하지 않은 링크입니다",
      description: "이 링크는 비활성화된 링크입니다. 견적서 담당자에게 문의해주세요.",
    },
    not_found: {
      title: "링크를 찾을 수 없습니다",
      description: "요청하신 견적서 링크가 존재하지 않습니다. URL을 다시 확인해주세요.",
    },
  }

  const error = errorMessages[reason ?? "not_found"] ?? errorMessages["not_found"]

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">⚠️</div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight">{error.title}</h1>
        <p className="mb-8 text-muted-foreground">{error.description}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          홈으로 이동
        </Link>
      </div>
    </div>
  )
}
