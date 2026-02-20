/**
 * 인증 관련 타입 정의
 */

/** 관리자 로그인 요청 */
export interface LoginRequest {
  email: string
  password: string
}

/** 세션 정보 */
export interface AdminSession {
  isAuthenticated: boolean
  email: string
}

/** 로그인 폼 에러 */
export interface LoginFormError {
  email?: string[]
  password?: string[]
  general?: string
}
