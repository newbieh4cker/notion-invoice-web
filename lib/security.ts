/**
 * 보안 유틸리티 모듈 (서버 사이드 전용)
 * CSRF 보호를 위한 Origin/Referer 헤더 검증 기능을 제공합니다.
 * 클라이언트 컴포넌트에서 import 금지
 */

/**
 * CSRF 보호를 위한 Origin/Referer 헤더 검증
 * 서버 액션에서 호출하여 요청 출처를 검증합니다.
 *
 * @param request - 검증할 Request 객체
 * @returns 허용된 출처면 true, 아니면 false
 */
export function validateCsrfOrigin(request: Request): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  let allowedOrigin: URL
  try {
    allowedOrigin = new URL(appUrl)
  } catch {
    // APP_URL 파싱 실패 시 로컬호스트만 허용
    allowedOrigin = new URL("http://localhost:3000")
  }

  // Origin 헤더 우선 확인
  const originHeader = request.headers.get("origin")
  if (originHeader) {
    return isOriginAllowed(originHeader, allowedOrigin)
  }

  // Origin이 없으면 Referer 헤더 확인
  const refererHeader = request.headers.get("referer")
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader)
      return isOriginAllowed(refererUrl.origin, allowedOrigin)
    } catch {
      return false
    }
  }

  // Origin도 Referer도 없으면 서버 사이드 요청으로 간주하여 허용
  // (Next.js 서버 액션은 내부에서 호출될 수 있음)
  return true
}

/**
 * 출처(origin)가 허용 목록에 포함되는지 확인
 *
 * @param origin - 검증할 출처 문자열
 * @param allowedOrigin - 허용된 기준 URL
 * @returns 허용 여부
 */
function isOriginAllowed(origin: string, allowedOrigin: URL): boolean {
  let requestOrigin: URL
  try {
    requestOrigin = new URL(origin)
  } catch {
    return false
  }

  // 로컬호스트 개발 환경 허용
  const isLocalhost =
    requestOrigin.hostname === "localhost" ||
    requestOrigin.hostname === "127.0.0.1" ||
    requestOrigin.hostname === "::1"

  if (isLocalhost && process.env.NODE_ENV !== "production") {
    return true
  }

  // 프로덕션: 정확한 호스트명과 포트 일치 확인
  return (
    requestOrigin.hostname === allowedOrigin.hostname &&
    requestOrigin.port === allowedOrigin.port &&
    requestOrigin.protocol === allowedOrigin.protocol
  )
}

/**
 * 요청의 CSRF 유효성 검증 및 에러 반환 헬퍼
 * 서버 액션에서 편리하게 사용할 수 있는 래퍼 함수
 *
 * @param request - 검증할 Request 객체
 * @returns 유효하지 않은 경우 에러 객체, 유효한 경우 null
 */
export function assertCsrfValid(
  request: Request
): { success: false; error: string } | null {
  if (!validateCsrfOrigin(request)) {
    return {
      success: false,
      error: "허용되지 않은 출처에서의 요청입니다.",
    }
  }
  return null
}
