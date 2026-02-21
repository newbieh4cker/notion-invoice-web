# 노션 연동 온라인 견적서 MVP 개발 로드맵

프리랜서/소규모 사업자가 노션에 작성한 견적서를 클라이언트가 로그인 없이 웹에서 조회하고 PDF로 다운로드할 수 있는 MVP 서비스

## 개요

노션 연동 온라인 견적서 MVP는 프리랜서/소규모 사업자(관리자)와 견적서를 받는 클라이언트(비회원)를 위한 서비스로 다음 기능을 제공합니다:

- **견적서 조회 (F001)**: 노션 DB에서 견적서 목록 및 상세 정보를 조회하여 대시보드/목록/상세 페이지에 표시
- **공유 링크 관리 (F002)**: 특정 견적서에 대한 토큰 기반 공유 링크를 생성하고 유효기간 설정 및 무효화 관리
- **클라이언트 열람 (F003)**: 공유받은 토큰으로 로그인 없이 견적서를 웹에서 조회
- **PDF 다운로드 (F004)**: 견적서를 한글 폰트가 지원되는 PDF로 다운로드
- **관리자 인증 (F010)**: 이메일/비밀번호 기반 관리자 로그인 및 세션 관리
- **토큰 검증 (F011)**: 공유 링크 접근 시 토큰 유효성 검증 및 만료/무효 토큰 차단

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15.5 (App Router + Turbopack) |
| UI | React 19.1, TailwindCSS v4, shadcn/ui (New York) |
| 언어 | TypeScript 5.6+ |
| 폼/검증 | React Hook Form 7.x + Zod |
| 상태 관리 | Zustand |
| 외부 API | @notionhq/client (노션 공식 SDK) |
| PDF 생성 | html2canvas + jspdf |
| 인증 | 쿠키 기반 세션 (서버 액션) |
| 배포 | Docker + GitHub Actions |

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
   - 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 -- 완료

- **Task 001: 프로젝트 초기 설정 및 환경 구성** -- 완료
  - See: `/tasks/001-project-setup.md`
  - ✅ Next.js 15.5 App Router + Turbopack 프로젝트 초기화
  - ✅ TailwindCSS v4 설정 (CSS 기반 설정, `@theme inline` 블록)
  - ✅ shadcn/ui 초기 설정 (New York 스타일, Lucide 아이콘)
  - ✅ `.env.example` 파일 작성 (노션 API 키, 관리자 계정, 세션 시크릿 등)
  - ✅ `.gitignore` 작성
  - ✅ `package.json` 의존성 설정 (react-hook-form, zod, zustand, @notionhq/client, html2canvas, jspdf 등)

- **Task 002: 전체 라우트 구조 및 레이아웃 생성** -- 완료
  - See: `/tasks/002-route-structure.md`
  - ✅ 관리자 라우트 그룹 `app/(admin)/` 및 레이아웃 생성 (Navbar + Footer)
  - ✅ 클라이언트 라우트 `app/invoice/[token]/` 생성 (Navbar 없음)
  - ✅ 로그인 페이지 `app/login/` 생성 (단독 레이아웃)
  - ✅ 오류 페이지 `app/invoice/error/` 생성 (reason 쿼리 파라미터: expired, invalid, not_found)
  - ✅ 루트 페이지에서 `/login`으로 리다이렉트 설정
  - ✅ 모든 주요 페이지의 빈 껍데기 파일 생성 (TODO 주석 포함)
  - ✅ 대시보드 `app/(admin)/dashboard/page.tsx`
  - ✅ 견적서 목록 `app/(admin)/invoices/page.tsx`
  - ✅ 견적서 상세 `app/(admin)/invoices/[id]/page.tsx`
  - ✅ 공유 링크 관리 `app/(admin)/invoices/[id]/shares/page.tsx`

- **Task 003: 타입 정의 및 인터페이스 설계** -- 완료
  - See: `/tasks/003-type-definitions.md`
  - ✅ `types/invoice.ts` - Invoice, InvoiceItem, InvoiceListItem, InvoiceStatus 타입, INVOICE_STATUS_LABELS 상수
  - ✅ `types/token.ts` - AccessToken, CreateTokenRequest, TokenValidationResult 타입
  - ✅ `types/auth.ts` - LoginRequest, AdminSession, LoginFormError 타입
  - ✅ `types/index.ts` - 통합 내보내기 배럴 파일

- **Task 004: 핵심 유틸리티 및 서버 사이드 모듈 구현** -- 완료
  - See: `/tasks/004-core-utilities.md`
  - ✅ `lib/notion.ts` - 노션 API 클라이언트 싱글톤 + DB ID 상수 (INVOICES, INVOICE_ITEMS, ACCESS_TOKENS)
  - ✅ `lib/session.ts` - 쿠키 기반 세션 관리 (getSession, createSession, deleteSession / base64 인코딩, httpOnly 쿠키, 24시간 만료)
  - ✅ `lib/token.ts` - 토큰 생성(randomBytes 32바이트 hex) / 만료 검증 / 만료일 계산 유틸리티
  - ✅ `lib/format.ts` - formatCurrency(원화), formatDate(한국어), formatDateShort(YYYY-MM-DD) 유틸리티
  - ✅ `lib/utils.ts` - cn() 클래스 병합 유틸리티 (clsx + tailwind-merge)

- **Task 005: 서버 액션 골격 및 커스텀 훅 구현** -- 완료
  - See: `/tasks/005-actions-hooks.md`
  - ✅ `actions/auth.ts` - loginAction(FormData 기반, Zod 검증, 환경변수 인증, 세션 생성 후 /dashboard 리다이렉트) + logoutAction(세션 삭제 후 /login 리다이렉트)
  - ✅ `actions/token.ts` - createTokenAction(Zod 검증, 토큰 생성, shareUrl 반환 / 노션 DB 저장 TODO) + revokeTokenAction(토큰 무효화 골격 / 노션 DB 업데이트 TODO)
  - ✅ `hooks/use-pdf-download.ts` - PDF 다운로드 훅 (html2canvas + jspdf 동적 import, 다중 페이지 처리, A4 세로)
  - ✅ `hooks/use-copy-to-clipboard.ts` - 클립보드 복사 훅 (Clipboard API + execCommand fallback, 2초 후 상태 초기화)

---

### Phase 2: 공통 컴포넌트 및 UI 완성 (더미 데이터 활용) -- 완료

- **Task 006: 추가 shadcn/ui 컴포넌트 설치 및 공통 컴포넌트 구현** -- 완료
  - See: `/tasks/006-shadcn-common-components.md`
  - ✅ `npx shadcn@latest add` 명령으로 18개 shadcn/ui 컴포넌트 추가 설치: table, dialog, select, separator, skeleton, toast, tooltip, avatar, tabs, sheet, alert-dialog, sonner, form, textarea, popover, calendar
  - ✅ 공통 로딩 컴포넌트 구현 (`components/common/loading-spinner.tsx`)
  - ✅ 공통 빈 상태 컴포넌트 구현 (`components/common/empty-state.tsx`)
  - ✅ 공통 에러 상태 컴포넌트 구현 (`components/common/error-state.tsx`)
  - ✅ 상태 Badge 컴포넌트 구현 (`components/invoice/status-badge.tsx`) - InvoiceStatus에 따른 색상/레이블 매핑 (draft: 회색, sent: 파란색, viewed: 노란색, paid: 초록색)

- **Task 007: 더미 데이터 생성 및 Zustand 스토어 구현** -- 완료
  - See: `/tasks/007-dummy-data-zustand-stores.md`
  - ✅ `lib/dummy-data.ts` - 견적서 더미 데이터 9건 생성 (모든 상태 포함: draft, sent, viewed, paid / 항목 2-5개씩 포함)
  - ✅ `lib/dummy-tokens.ts` - 공유 토큰 더미 데이터 8건 생성 (활성/만료/무효화 상태 포함)
  - ✅ `stores/invoice-store.ts` - 견적서 목록 필터(status)/검색(clientName)/정렬(issueDate, totalAmount) 상태 관리 (Zustand)
  - ✅ `stores/token-store.ts` - 토큰 생성 모달 열림/닫힘, 선택된 토큰 등 UI 상태 관리 (Zustand)

- **Task 008: 로그인 페이지 UI 구현 (F010)** -- 완료
  - See: `/tasks/008-login-page-ui.md`
  - ✅ `components/auth/login-form.tsx` - React Hook Form + Zod 기반 로그인 폼 (`"use client"`)
  - ✅ 이메일 입력 필드 (shadcn/ui Input + Label, type="email")
  - ✅ 비밀번호 입력 필드 (shadcn/ui Input + Label, type="password")
  - ✅ Zod 스키마 기반 폼 유효성 검사 실시간 에러 표시
  - ✅ 로그인 버튼 (useFormStatus 기반 로딩 스피너 표시)
  - ✅ 서버 액션(loginAction) 에러 메시지 표시 (잘못된 계정 정보)
  - ✅ `app/login/page.tsx` 업데이트 - LoginForm 컴포넌트 통합
  - ✅ 반응형 레이아웃 (중앙 정렬, max-w-sm)

- **Task 009: 대시보드 페이지 UI 구현 (F001)** -- 완료
  - See: `/tasks/009-dashboard-page-ui.md`
  - ✅ `components/dashboard/stats-cards.tsx` - 전체/상태별 견적서 수 카드 4개 (전체, 발송, 열람, 지불 / shadcn/ui Card + Lucide 아이콘)
  - ✅ `components/dashboard/recent-invoices-table.tsx` - 최근 견적서 5건 테이블 (번호, 클라이언트명, 금액, 상태, 발행일 / shadcn/ui Table)
  - ✅ 테이블 행 클릭 시 `/invoices/[id]` 견적서 상세 페이지로 이동 링크
  - ✅ 더미 데이터를 활용한 완전한 UI 렌더링
  - ✅ `app/(admin)/dashboard/page.tsx` 업데이트 - StatsCards, RecentInvoicesTable 컴포넌트 통합

- **Task 010: 견적서 목록 페이지 UI 구현 (F001)** -- 완료
  - See: `/tasks/010-invoice-list-page-ui.md`
  - ✅ `components/invoice/invoice-filters.tsx` - 상태별 필터링 탭 (전체/초안/발송/열람/지불 / shadcn/ui Tabs 활용)
  - ✅ `components/invoice/invoice-search.tsx` - 클라이언트명 검색 입력 필드 (shadcn/ui Input + Search 아이콘)
  - ✅ `components/invoice/invoice-table.tsx` - 견적서 목록 테이블 (번호, 클라이언트명, 발행일, 금액, 상태, 상세보기 액션 / shadcn/ui Table)
  - ✅ `components/invoice/invoice-sort.tsx` - 정렬 기능 드롭다운 (발행일순, 금액순 / shadcn/ui Select)
  - ✅ Zustand 스토어(invoice-store)와 연동하여 필터/검색/정렬 상태 관리
  - ✅ 더미 데이터 기반 완전한 목록 UI 렌더링
  - ✅ 반응형 디자인 (모바일: 카드 형태, 데스크탑: 테이블 형태)
  - ✅ `app/(admin)/invoices/page.tsx` 업데이트 - 컴포넌트 통합

- **Task 011: 견적서 상세 페이지 UI 구현 (F001, F002, F004)** -- 완료
  - See: `/tasks/011-invoice-detail-page-ui.md`
  - ✅ `components/invoice/invoice-header.tsx` - 견적서 헤더 정보 (번호, 발행일, 유효기간, 상태 Badge)
  - ✅ `components/invoice/client-info.tsx` - 클라이언트 정보 카드 (이름, 이메일, 전화 / shadcn/ui Card)
  - ✅ `components/invoice/invoice-items-table.tsx` - 항목 테이블 (상품/서비스명, 수량, 단가, 소계 / shadcn/ui Table)
  - ✅ `components/invoice/invoice-summary.tsx` - 합계 섹션 (소계, 세금(10%), 총액 / formatCurrency 활용)
  - ✅ `components/invoice/invoice-actions.tsx` - 액션 버튼 바 (공유 링크 생성 버튼, PDF 다운로드 버튼, 뒤로 가기 버튼)
  - ✅ 더미 데이터 기반 완전한 상세 UI 렌더링
  - ✅ `app/(admin)/invoices/[id]/page.tsx` 업데이트 - 컴포넌트 통합

- **Task 012: 공유 링크 관리 페이지 UI 구현 (F002, F011)** -- 완료
  - See: `/tasks/012-share-link-management-ui.md`
  - ✅ `components/share/create-token-form.tsx` - 토큰 생성 폼 (클라이언트 이메일, 유효기간 설정 드롭다운(7일/14일/30일/60일/90일) - React Hook Form + Zod)
  - ✅ `components/share/token-list.tsx` - 토큰 목록 테이블 (이메일, 토큰(마스킹), 생성일, 만료일, 마지막접근일, 상태(활성/만료/무효화))
  - ✅ `components/share/token-actions.tsx` - 토큰별 액션 버튼 (링크 복사(use-copy-to-clipboard 훅), 무효화 버튼)
  - ✅ `components/share/share-link-display.tsx` - 생성된 공유 링크 URL 전체 표시 및 원클릭 복사
  - ✅ 토큰 무효화 확인 다이얼로그 (shadcn/ui AlertDialog)
  - ✅ 더미 토큰 데이터 기반 완전한 관리 UI 렌더링
  - ✅ `app/(admin)/invoices/[id]/shares/page.tsx` 업데이트 - 컴포넌트 통합

- **Task 013: 클라이언트 견적서 열람 페이지 UI 구현 (F003, F004, F011)** -- 완료
  - See: `/tasks/013-client-invoice-view-ui.md`
  - ✅ `components/invoice/invoice-view.tsx` - 클라이언트용 견적서 전체 뷰 (회사 정보, 클라이언트 정보, 항목 테이블, 합계 섹션 / 관리자 상세와 유사하되 읽기 전용)
  - ✅ `components/invoice/pdf-download-button.tsx` - PDF 다운로드 버튼 (`"use client"`, use-pdf-download 훅 연동, 로딩 상태 표시)
  - ✅ 인쇄 친화적 레이아웃 (`@media print` CSS 미디어 쿼리 - 불필요 요소 숨김)
  - ✅ 테마 토글 지원 (ThemeToggle 컴포넌트 헤더 영역에 배치)
  - ✅ 더미 데이터 기반 완전한 열람 UI 렌더링
  - ✅ 오류 페이지 UI 확인 (만료/무효/미존재 토큰 케이스별 메시지)
  - ✅ `app/invoice/[token]/page.tsx` 업데이트 - 컴포넌트 통합

- **Task 014: Navbar 개선 및 전체 네비게이션 완성** -- 완료
  - See: `/tasks/014-navbar-navigation.md`
  - ✅ `components/layout/navbar.tsx` 업데이트 - 로그아웃 버튼 추가 (logoutAction 서버 액션 연동)
  - ✅ 현재 페이지 활성 메뉴 하이라이트 (`usePathname` 훅 활용, 활성 링크에 `text-foreground` 적용)
  - ✅ 모바일 반응형 메뉴 구현 (shadcn/ui Sheet 컴포넌트 기반 햄버거 메뉴 / Lucide Menu 아이콘)
  - ✅ 전체 페이지 간 네비게이션 플로우 검증 (대시보드 <-> 견적서 목록 <-> 견적서 상세 <-> 공유 링크 관리)

---

### Phase 3: 핵심 기능 구현 (노션 API 연동) -- 완료 ✅

- **Task 015: 노션 API 데이터 조회 함수 구현 (F001)** -- 완료 ✅
  - ✅ `lib/notion.ts` 확장 - 견적서 목록/상세/항목 조회 함수 구현
  - ✅ 노션 DB 속성 파싱 헬퍼 함수 (12가지 타입 지원)
  - ✅ 에러 핸들링 및 재시도 로직 (지수 백오프)
  - ✅ `actions/invoice.ts` 서버 액션 구현

- **Task 016: 토큰 CRUD 노션 DB 연동 구현 (F002, F011)** -- 완료 ✅
  - ✅ 토큰 저장/조회/무효화/유효성 검증 함수 구현
  - ✅ `actions/token.ts` 실제 노션 API 연동

- **Task 017: 관리자 인증 미들웨어 및 세션 가드 구현 (F010)** -- 완료 ✅
  - ✅ `middleware.ts` 구현
  - ✅ 관리자 페이지 접근 제어

- **Task 018: 더미 데이터를 실제 노션 API 호출로 교체** -- 완료 ✅
  - ✅ 모든 페이지 서버 컴포넌트화
  - ✅ 실제 노션 데이터 렌더링

- **Task 019: 핵심 기능 통합 테스트** -- 완료 ✅
  - ✅ E2E 테스트 30/30 통과
  - ✅ 관리자 여정 테스트
  - ✅ 클라이언트 여정 테스트
  - ✅ 보안 테스트

---

### Phase 4: PDF 다운로드 및 고급 기능 구현 -- 진행 중 🚀

- **Task 020: PDF 다운로드 기능 완성 (F004)** - 우선순위
  - `hooks/use-pdf-download.ts` 개선 - 한글 폰트 임베딩 처리 (Noto Sans KR 또는 Pretendard / base64 인코딩 폰트 파일)
  - 견적서 전용 PDF 레이아웃 최적화 (A4 용지 기준 마진/패딩 조정, 회사 로고 영역)
  - PDF 파일명 자동 생성 (`견적서_INV-2026-001_홍길동.pdf` 형식 - invoiceNumber + clientName 조합)
  - `components/invoice/pdf-download-button.tsx` - 관리자 견적서 상세 페이지에서 PDF 다운로드 버튼 연동
  - 클라이언트 열람 페이지에서 PDF 다운로드 버튼 연동
  - PDF 생성 중 로딩 상태 (스피너) 및 에러 핸들링 (토스트 알림)
  - ## 테스트 체크리스트
    - Playwright MCP로 관리자 견적서 상세에서 PDF 다운로드 버튼 클릭 테스트
    - 클라이언트 열람 페이지에서 PDF 다운로드 버튼 클릭 테스트
    - PDF 파일명이 올바른 형식으로 생성되는지 확인
    - PDF 생성 중 로딩 상태 표시 확인

- **Task 021: 클라이언트 견적서 열람 고급 기능 (F003)**
  - 마지막 접근일 자동 기록 - 서버 컴포넌트에서 `updateLastAccessedAt(tokenId)` 호출 (백그라운드)
  - 견적서 상태 자동 변경 - 클라이언트 최초 열람 시 `sent` -> `viewed` (노션 DB status 필드 업데이트)
  - 브라우저 인쇄 기능 지원 (인쇄 버튼 추가 + `@media print` CSS 최적화 - Navbar, Footer, 버튼 숨김)
  - 견적서 유효기간 만료 알림 (expiryDate가 지난 견적서에 노란색 경고 배너 표시)
  - ## 테스트 체크리스트
    - Playwright MCP로 클라이언트 열람 후 노션 DB에서 마지막 접근일 업데이트 확인
    - 견적서 상태 자동 변경 확인 (sent -> viewed)
    - 유효기간 만료 견적서에 경고 배너 표시 확인
    - 인쇄 버튼 동작 확인

- **Task 022: 토스트 알림 및 UX 개선**
  - Sonner 기반 토스트 알림 시스템 통합 (`components/ui/sonner.tsx` + 루트 레이아웃에 `<Toaster />` 추가)
  - 공유 링크 복사 성공 토스트 ("링크가 클립보드에 복사되었습니다")
  - 토큰 생성 성공/실패 토스트
  - 토큰 무효화 성공/실패 토스트
  - PDF 다운로드 시작/완료/실패 토스트
  - 로그인 성공/실패 토스트
  - 로딩 스켈레톤 UI 적용 (shadcn/ui Skeleton 활용)
    - 대시보드: 통계 카드 스켈레톤 + 테이블 행 스켈레톤
    - 견적서 목록: 테이블 행 스켈레톤
    - 견적서 상세: 헤더/항목/합계 영역 스켈레톤
    - 공유 링크 관리: 토큰 목록 스켈레톤

---

### Phase 5: 최적화, 보안 및 배포

- **Task 023: 보안 강화 및 에러 핸들링**
  - 세션 보안 강화 - SESSION_SECRET 환경변수 기반 HMAC 서명/검증 추가 (base64만으로는 변조 가능)
  - CSRF 보호 처리 - 서버 액션에서 Origin/Referer 헤더 검증
  - 환경변수 검증 - 앱 시작 시 필수 환경변수 존재 확인 (`lib/env.ts` 신규 생성, Zod 스키마 검증)
  - 전역 에러 바운더리 - `app/error.tsx` (런타임 에러 처리), `app/not-found.tsx` (404 페이지)
  - `app/(admin)/error.tsx` - 관리자 영역 에러 바운더리
  - 노션 API 호출 재시도 로직 (최대 3회, 지수 백오프: 1초, 2초, 4초)
  - 입력값 서버 사이드 이중 검증 (클라이언트 Zod + 서버 액션 Zod 동일 스키마)
  - ## 테스트 체크리스트
    - Playwright MCP로 잘못된 URL 접근 시 404 페이지 표시 확인
    - 서버 에러 발생 시 에러 바운더리 동작 확인
    - 필수 환경변수 누락 시 적절한 에러 메시지 확인

- **Task 024: 성능 최적화**
  - 노션 API 응답 캐싱 전략 (Next.js 서버 컴포넌트 캐싱, `revalidate` 설정 - 견적서 목록 60초, 상세 30초)
  - 이미지 최적화 (`next/image` 적용 - 회사 로고 등)
  - 동적 import 최적화 확인 (html2canvas, jspdf는 이미 동적 import 적용됨)
  - 견적서 목록 페이지네이션 구현 (노션 API cursor 기반 페이지네이션, 페이지당 20건)
  - SEO 메타데이터 최적화 (클라이언트 열람 페이지 OG 태그 - 견적서 번호, 클라이언트명, 금액 포함)
  - 번들 사이즈 분석 (`npm run build` 후 사이즈 확인) 및 불필요 의존성 제거

- **Task 025: Docker 구성 및 CI/CD 파이프라인**
  - `Dockerfile` 작성 - 로컬 개발용 (Node.js 20 Alpine, hot reload 지원)
  - `Dockerfile.prod` 작성 - 프로덕션 빌드 최적화 (multi-stage build, standalone output)
  - `docker-compose.yml` 작성 - 로컬 개발 환경 (환경변수 .env.local 마운트)
  - `docker-compose.prod.yml` 작성 - 프로덕션 환경 (환경변수 외부 주입)
  - `.github/workflows/docker-build.yml` - main 브랜치 커밋/푸시 시 도커 이미지 빌드 및 푸시 자동화
  - `README.md` 업데이트 - 프로젝트 소개, 환경 설정 방법, 로컬 실행 방법, Docker 실행 방법, 배포 방법 포함

- **Task 026: 최종 통합 테스트 및 배포 준비**
  - 전체 사용자 여정 E2E 테스트 (관리자 플로우 + 클라이언트 플로우 end-to-end)
  - 반응형 디자인 최종 검증 (모바일 375px, 태블릿 768px, 데스크탑 1280px+)
  - 다크 모드/라이트 모드 전체 페이지 시각적 검증
  - 접근성 검증 (키보드 네비게이션 Tab 순서, 스크린 리더 aria 라벨)
  - 크로스 브라우저 테스트 (Chrome, Firefox, Safari, Edge)
  - Vercel 배포 설정 (환경변수 구성, 빌드 명령어 확인)
  - 프로덕션 환경 동작 확인 및 최종 QA
