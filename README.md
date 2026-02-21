# 노션 연동 온라인 견적서

프리랜서/소규모 사업자가 노션에 작성한 견적서를 클라이언트가 별도 로그인 없이 웹에서 조회하고 PDF로 다운로드할 수 있는 서비스입니다.

## 프로젝트 개요

**목적**: 노션 DB에 저장된 견적서를 클라이언트에게 안전하게 공유하고, PDF 다운로드 기능을 제공

**타겟 사용자**:
- 관리자 (프리랜서/소규모 사업자): 견적서 조회 및 공유 링크 생성
- 클라이언트 (비회원): 공유받은 링크로 견적서 열람 및 PDF 다운로드

## 주요 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/login` | 관리자 이메일/비밀번호 로그인 |
| 대시보드 | `/dashboard` | 견적서 현황 및 최근 목록 |
| 견적서 목록 | `/invoices` | 전체 견적서 목록 (필터/검색) |
| 견적서 상세 | `/invoices/[id]` | 견적서 상세 정보, 공유 링크 생성, PDF |
| 공유 링크 관리 | `/invoices/[id]/shares` | 토큰 생성, 복사, 무효화 |
| 클라이언트 열람 | `/invoice/[token]` | 토큰 기반 견적서 열람 (비회원) |
| 오류 페이지 | `/invoice/error` | 만료/무효 토큰 안내 |

## 핵심 기능

- **견적서 조회** (F001): 노션 DB에서 견적서 데이터를 조회하여 목록 및 상세 표시
- **공유 링크 생성** (F002): 토큰 기반 공유 링크 생성, 유효기간 설정, 무효화
- **클라이언트 열람** (F003): 로그인 없이 공유받은 링크로 견적서 조회
- **PDF 다운로드** (F004): 한글 폰트 지원 PDF 생성 및 다운로드
- **관리자 인증** (F010): 쿠키 기반 세션 관리
- **토큰 검증** (F011): 만료/무효 토큰 차단

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15.5.x (App Router + Turbopack) |
| 런타임 | React 19.1.0 |
| 언어 | TypeScript 5.x |
| 스타일링 | TailwindCSS v4 (설정파일 없음) |
| UI 컴포넌트 | shadcn/ui (New York style) |
| 폼 관리 | React Hook Form + Zod |
| 상태 관리 | Zustand |
| 노션 연동 | @notionhq/client |
| PDF 생성 | html2canvas + jspdf |
| 인증 | 쿠키 기반 세션 (Next.js) |

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd invoice-web
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 다음 값을 입력하세요:

```env
# 노션 API 키 (https://www.notion.so/my-integrations 에서 발급)
NOTION_API_KEY=secret_xxxxxx

# 노션 데이터베이스 ID
NOTION_INVOICES_DB_ID=xxxxxx
NOTION_INVOICE_ITEMS_DB_ID=xxxxxx
NOTION_ACCESS_TOKENS_DB_ID=xxxxxx

# 관리자 계정
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 노션 설정

1. [노션 개발자 페이지](https://www.notion.so/my-integrations)에서 인테그레이션 생성
2. 견적서 DB, 견적서 항목 DB, 공유 토큰 DB를 인테그레이션에 연결
3. 각 DB의 ID를 환경변수에 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 (자동으로 `/login`으로 리다이렉트됩니다)

### 6. 빌드

```bash
npm run build
npm run start
```

## 노션 DB 구조

### 견적서 DB (Invoices)

| 필드 | 타입 | 설명 |
|------|------|------|
| 견적서 번호 | Title | 예: INV-2026-001 |
| 클라이언트명 | Text | |
| 클라이언트 이메일 | Email | |
| 클라이언트 전화 | Phone | |
| 발행일 | Date | |
| 유효기간 | Date | |
| 회사명 | Text | 발행 회사명 |
| 합계 금액 | Number | |
| 상태 | Select | draft, sent, viewed, paid |
| 항목 | Relation | 견적서 항목 DB 연결 |

### 견적서 항목 DB (Invoice Items)

| 필드 | 타입 | 설명 |
|------|------|------|
| 상품/서비스명 | Title | |
| 수량 | Number | |
| 단가 | Number | |
| 소계 | Formula | 수량 x 단가 |
| 견적서 | Relation | 견적서 DB 연결 |

### 공유 토큰 DB (Access Tokens)

| 필드 | 타입 | 설명 |
|------|------|------|
| 토큰 | Title | 고유 토큰 값 |
| 견적서 ID | Text | 노션 페이지 ID |
| 클라이언트 이메일 | Email | |
| 만료일 | Date | |
| 무효화 여부 | Checkbox | |
| 마지막 접근일 | Date | |

## 프로젝트 구조

```
invoice-web/
├── app/                        # Next.js App Router
│   ├── (admin)/               # 관리자 라우트 그룹 (Navbar/Footer 포함)
│   │   ├── layout.tsx         # 관리자 레이아웃
│   │   ├── dashboard/         # 대시보드 페이지
│   │   └── invoices/          # 견적서 관리
│   │       └── [id]/          # 견적서 상세
│   │           └── shares/    # 공유 링크 관리
│   ├── login/                 # 로그인 페이지
│   ├── invoice/               # 클라이언트 접근 (Navbar 없음)
│   │   ├── [token]/           # 견적서 열람
│   │   └── error/             # 오류 페이지
│   ├── globals.css
│   └── layout.tsx             # 루트 레이아웃
├── actions/                   # 서버 액션
│   ├── auth.ts                # 로그인/로그아웃
│   └── token.ts               # 토큰 생성/무효화
├── components/
│   ├── invoice/               # 견적서 관련 컴포넌트
│   ├── layout/                # Navbar, Footer, ThemeToggle
│   ├── providers/             # ThemeProvider
│   └── ui/                    # shadcn/ui 컴포넌트
├── hooks/                     # 커스텀 훅
│   ├── use-pdf-download.ts    # PDF 다운로드
│   └── use-copy-to-clipboard.ts  # 클립보드 복사
├── lib/                       # 유틸리티
│   ├── notion.ts              # 노션 API 클라이언트
│   ├── session.ts             # 세션 관리
│   ├── token.ts               # 토큰 유틸리티
│   ├── format.ts              # 데이터 포맷팅
│   └── utils.ts               # 클래스 병합 (cn)
├── types/                     # TypeScript 타입 정의
│   ├── invoice.ts             # Invoice, InvoiceItem 타입
│   ├── token.ts               # AccessToken 타입
│   ├── auth.ts                # 인증 관련 타입
│   └── index.ts               # 통합 내보내기
└── docs/
    └── PRD.md                 # 프로젝트 요구사항 문서
```

## 개발 명령어

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # 린트 검사
npx tsc --noEmit     # TypeScript 타입 체크

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]
```

## E2E 테스트

### Playwright E2E 테스트

```bash
# 전체 E2E 테스트 실행
npx playwright test test/e2e/

# 특정 테스트 파일 실행
npx playwright test test/e2e/admin-journey.spec.ts     # 관리자 여정 (10개 테스트)
npx playwright test test/e2e/client-journey.spec.ts    # 클라이언트 여정 (10개 테스트)
npx playwright test test/e2e/security.spec.ts          # 보안 테스트 (10개 테스트)

# 특정 테스트만 실행
npx playwright test -g "로그인 페이지"

# UI 모드 (시각적 디버깅)
npx playwright test --ui

# 디버그 모드
npx playwright test --debug

# HTML 리포트 보기
npx playwright show-report
```

### 테스트 스위트 설명

- **admin-journey.spec.ts**: 관리자 로그인부터 로그아웃까지의 전체 플로우 (10개 테스트)
  - 로그인, 대시보드, 견적서 목록, 네비게이션, 테마 토글, 로그아웃

- **client-journey.spec.ts**: 클라이언트가 토큰을 통해 견적서에 접근하는 플로우 (10개 테스트)
  - 토큰 검증, 에러 페이지, 라우팅, 접근 제어

- **security.spec.ts**: 보안 및 인증 관련 테스트 (10개 테스트)
  - 미들웨어 보안, CSRF, XSS, 세션, 환경변수 노출, HTTP 헤더

### 테스트 결과

- **총 30개 테스트, 100% 통과**
- **전체 실행 시간**: ~23.5초
- 자세한 내용은 [TEST_REPORT.md](./TEST_REPORT.md) 참조

## 개발 상태

- [x] 프로젝트 기본 구조 설정
- [x] 환경변수 템플릿
- [x] 타입 정의 (Invoice, InvoiceItem, AccessToken)
- [x] 서버 액션 스캐폴딩 (auth, token)
- [x] 커스텀 훅 (PDF 다운로드, 클립보드 복사)
- [ ] 노션 API 연동 (견적서 조회)
- [ ] 관리자 로그인 UI
- [ ] 대시보드 컴포넌트
- [ ] 견적서 목록 및 상세 컴포넌트
- [ ] 공유 링크 관리 UI
- [ ] 클라이언트 견적서 열람 UI
- [ ] PDF 다운로드 (한글 폰트 지원)
- [ ] 토큰 유효성 검증 미들웨어

## 문서

- [PRD 문서](./docs/PRD.md) - 상세 기능 요구사항
- [개발 가이드](./CLAUDE.md) - 개발 지침
