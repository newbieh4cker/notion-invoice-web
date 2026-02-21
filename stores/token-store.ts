/**
 * 공유 토큰 Zustand 스토어
 * 토큰 목록, 선택된 토큰, 모달 상태 관리
 * devtools 미들웨어 적용 (개발 환경 디버깅 지원)
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { AccessToken } from "@/types/token"

/** 모달 유형 구분 */
export type TokenModalType = "create" | "revoke" | "detail" | null

/** 토큰 스토어 상태 */
interface TokenState {
  /** 전체 토큰 목록 */
  tokens: AccessToken[]
  /** 현재 선택된 토큰 (상세/폐기 모달용) */
  selectedToken: AccessToken | null
  /** 현재 열린 모달 유형 */
  modalType: TokenModalType
  /** 모달과 연결된 견적서 ID (토큰 생성 시 사용) */
  activeInvoiceId: string | null
  /** 로딩 상태 */
  isLoading: boolean
}

/** 토큰 스토어 액션 */
interface TokenActions {
  /** 토큰 목록 전체 교체 */
  setTokens: (tokens: AccessToken[]) => void
  /** 단일 토큰 추가 */
  addToken: (token: AccessToken) => void
  /** 토큰 폐기 (isRevoked = true 로 업데이트) */
  revokeToken: (id: string) => void
  /** 토큰 삭제 (id 기준) */
  removeToken: (id: string) => void
  /** 선택된 토큰 설정 */
  setSelectedToken: (token: AccessToken | null) => void
  /** 특정 모달 열기 */
  openModal: (type: Exclude<TokenModalType, null>, invoiceId?: string) => void
  /** 모달 닫기 (선택 토큰 초기화 포함) */
  closeModal: () => void
  /** 로딩 상태 설정 */
  setIsLoading: (loading: boolean) => void
  /** 특정 견적서의 유효한 토큰 목록 반환 (만료/폐기 제외) */
  getValidTokensByInvoiceId: (invoiceId: string) => AccessToken[]
  /** 특정 견적서의 모든 토큰 반환 */
  getAllTokensByInvoiceId: (invoiceId: string) => AccessToken[]
}

/** 토큰 스토어 */
export const useTokenStore = create<TokenState & TokenActions>()(
  devtools(
    (set, get) => ({
      // ─── 초기 상태 ───────────────────────────────────────────────
      tokens: [],
      selectedToken: null,
      modalType: null,
      activeInvoiceId: null,
      isLoading: false,

      // ─── 토큰 CRUD 액션 ──────────────────────────────────────────
      setTokens: (tokens) => {
        set({ tokens }, false, "token/setTokens")
      },

      addToken: (token) => {
        set(
          (state) => ({ tokens: [token, ...state.tokens] }),
          false,
          "token/addToken"
        )
      },

      revokeToken: (id) => {
        set(
          (state) => ({
            tokens: state.tokens.map((tok) =>
              tok.id === id ? { ...tok, isRevoked: true } : tok
            ),
            // 선택된 토큰도 동기화
            selectedToken:
              state.selectedToken?.id === id
                ? { ...state.selectedToken, isRevoked: true }
                : state.selectedToken,
          }),
          false,
          "token/revokeToken"
        )
      },

      removeToken: (id) => {
        set(
          (state) => ({
            tokens: state.tokens.filter((tok) => tok.id !== id),
            selectedToken:
              state.selectedToken?.id === id ? null : state.selectedToken,
          }),
          false,
          "token/removeToken"
        )
      },

      setSelectedToken: (token) => {
        set({ selectedToken: token }, false, "token/setSelectedToken")
      },

      // ─── 모달 제어 액션 ───────────────────────────────────────────
      openModal: (type, invoiceId) => {
        set(
          {
            modalType: type,
            // 토큰 생성 모달인 경우 연결된 견적서 ID 저장
            activeInvoiceId: invoiceId ?? get().activeInvoiceId,
          },
          false,
          "token/openModal"
        )
      },

      closeModal: () => {
        set(
          {
            modalType: null,
            selectedToken: null,
            activeInvoiceId: null,
          },
          false,
          "token/closeModal"
        )
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading }, false, "token/setIsLoading")
      },

      // ─── 파생 데이터 ──────────────────────────────────────────────
      getValidTokensByInvoiceId: (invoiceId) => {
        const { tokens } = get()
        const now = new Date()

        return tokens.filter(
          (tok) =>
            tok.invoiceId === invoiceId &&
            !tok.isRevoked &&
            new Date(tok.expiresAt) > now
        )
      },

      getAllTokensByInvoiceId: (invoiceId) => {
        const { tokens } = get()
        return tokens.filter((tok) => tok.invoiceId === invoiceId)
      },
    }),
    {
      name: "token-store", // Redux DevTools 에서 표시될 스토어 이름
    }
  )
)
