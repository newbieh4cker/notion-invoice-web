/**
 * 환경변수 검증 모듈 (서버 사이드 전용)
 * Zod 스키마로 필수 환경변수를 검증하고 타입 안전한 접근을 제공합니다.
 * 클라이언트 컴포넌트에서 import 금지
 */

import { z } from "zod"

/** 서버 환경변수 스키마 */
const serverEnvSchema = z.object({
  // 노션 API 설정
  NOTION_API_KEY: z
    .string()
    .min(1, "NOTION_API_KEY가 설정되지 않았습니다")
    .startsWith("secret_", "NOTION_API_KEY는 'secret_'으로 시작해야 합니다"),

  NOTION_INVOICES_DB_ID: z
    .string()
    .min(1, "NOTION_INVOICES_DB_ID가 설정되지 않았습니다"),

  NOTION_INVOICE_ITEMS_DB_ID: z
    .string()
    .min(1, "NOTION_INVOICE_ITEMS_DB_ID가 설정되지 않았습니다"),

  NOTION_ACCESS_TOKENS_DB_ID: z
    .string()
    .min(1, "NOTION_ACCESS_TOKENS_DB_ID가 설정되지 않았습니다"),

  // 관리자 인증 설정
  ADMIN_EMAIL: z
    .string()
    .email("ADMIN_EMAIL은 유효한 이메일 주소여야 합니다"),

  ADMIN_PASSWORD: z
    .string()
    .min(8, "ADMIN_PASSWORD는 최소 8자 이상이어야 합니다"),

  // 세션 보안 설정
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET은 최소 32자 이상이어야 합니다 (보안 강화를 위해)"),
})

/** 공개 환경변수 스키마 (클라이언트에서 접근 가능) */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL은 유효한 URL이어야 합니다")
    .default("http://localhost:3000"),

  NEXT_PUBLIC_APP_NAME: z.string().default("노션 연동 온라인 견적서"),
})

/** 검증된 서버 환경변수 타입 */
export type ServerEnv = z.infer<typeof serverEnvSchema>

/** 검증된 공개 환경변수 타입 */
export type PublicEnv = z.infer<typeof publicEnvSchema>

// 검증 결과 캐시 (모듈 로드 시 한 번만 검증)
let _serverEnv: ServerEnv | null = null
let _publicEnv: PublicEnv | null = null

/**
 * 서버 환경변수 검증 및 반환
 * 검증 실패 시 명확한 에러 메시지와 함께 예외 발생
 * 서버 컴포넌트, 서버 액션, API 라우트에서 사용
 */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) {
    return _serverEnv
  }

  const result = serverEnvSchema.safeParse({
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_INVOICES_DB_ID: process.env.NOTION_INVOICES_DB_ID,
    NOTION_INVOICE_ITEMS_DB_ID: process.env.NOTION_INVOICE_ITEMS_DB_ID,
    NOTION_ACCESS_TOKENS_DB_ID: process.env.NOTION_ACCESS_TOKENS_DB_ID,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
  })

  if (!result.success) {
    // 누락되거나 잘못된 환경변수 목록을 명확하게 출력
    const errorMessages = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(루트)"}: ${issue.message}`)
      .join("\n")

    const errorText = `
[환경변수 오류] 필수 환경변수가 누락되었거나 잘못되었습니다.
.env.local 파일을 확인하고 아래 항목을 수정하세요:

${errorMessages}

참고: .env.example 파일을 복사하여 .env.local을 생성하세요.
  cp .env.example .env.local
`
    throw new Error(errorText)
  }

  _serverEnv = result.data
  return _serverEnv
}

/**
 * 공개 환경변수 반환 (클라이언트에서도 사용 가능)
 * NEXT_PUBLIC_ 접두사 변수만 포함
 */
export function getPublicEnv(): PublicEnv {
  if (_publicEnv) {
    return _publicEnv
  }

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  })

  // 공개 환경변수는 기본값이 있으므로 검증 실패 가능성 낮지만 방어적 처리
  _publicEnv = result.success ? result.data : {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: "노션 연동 온라인 견적서",
  }

  return _publicEnv
}

/**
 * 테스트 환경에서 환경변수 캐시 초기화 (테스트 용도)
 */
export function _resetEnvCache(): void {
  _serverEnv = null
  _publicEnv = null
}
