/**
 * 데이터 포맷팅 유틸리티
 */

/**
 * 금액을 한국 원화 형식으로 포맷
 * @example formatCurrency(1000000) → "1,000,000원"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @example formatDate("2026-02-19") → "2026년 2월 19일"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toISOString().split("T")[0]
}
