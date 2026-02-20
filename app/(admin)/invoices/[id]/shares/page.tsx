import { Metadata } from "next"

interface SharesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: SharesPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `공유 링크 관리 (${id}) | 견적서 관리`,
    description: "견적서 공유 링크 생성 및 관리",
  }
}

/**
 * 공유 링크 관리 페이지 (F002, F011)
 * - 특정 견적서의 공유 토큰 목록 조회
 * - 새 토큰 생성 (클라이언트 이메일, 유효기간 설정)
 * - 토큰 복사 및 무효화
 */
export default async function SharesPage({ params }: SharesPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">공유 링크 관리</h1>
        <p className="mt-2 text-muted-foreground">
          견적서 ID: {id} 의 공유 링크를 관리합니다
        </p>
      </div>
      {/* TODO: CreateTokenForm 컴포넌트 */}
      {/* TODO: TokenList 컴포넌트 */}
      <p className="text-sm text-muted-foreground">공유 링크 관리 구현 예정</p>
    </div>
  )
}
