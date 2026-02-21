# Development Guidelines for Notion Invoice Web

## 1. 프로젝트 개요

### 프로젝트명 & 목표
**노션 연동 온라인 견적서 MVP** - 프리랜서/소규모 사업자가 노션에 작성한 견적서를 클라이언트가 로그인 없이 웹에서 조회하고 PDF로 다운로드할 수 있는 서비스

### 타겟 사용자
- **관리자**: 견적서를 작성하고 관리하는 프리랜서/사업자
- **클라이언트**: 비회원 상태에서 공유받은 링크를 통해 견적서를 조회

### 핵심 기능
- F001: 견적서 목록/상세 조회 (노션 API)
- F002: 공유 링크(토큰) 생성 및 관리
- F003: 클라이언트 견적서 열람 (토큰 기반)
- F004: PDF 다운로드 (한글 폰트 지원)
- F010: 관리자 인증 (로그인/로그아웃)
- F011: 토큰 유효성 검증

---

## 2. 프로젝트 아키텍처

### 디렉토리 구조와 역할

```
invoice-web/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (ThemeProvider)
│   ├── page.tsx                  # 로그인으로 리다이렉트
│   ├── globals.css               # TailwindCSS v4 전역 스타일
│   ├── login/                    # 관리자 로그인 (F010)
│   ├── (admin)/                  # 관리자 라우트 그룹 (세션 검증)
│   │   ├── layout.tsx            # Navbar + Footer
│   │   ├── dashboard/            # 대시보드 (F001)
│   │   ├── invoices/             # 견적서 목록 (F001)
│   │   ├── [id]/                 # 견적서 상세 (F001, F002, F004)
│   │   └── [id]/shares/          # 공유 링크 관리 (F002, F011)
│   └── invoice/                  # 클라이언트 라우트 (토큰 기반)
│       ├── [token]/              # 클라이언트 열람 (F003, F004, F011)
│       └── error/                # 토큰 오류 페이지
│
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── layout/                   # Navbar, Footer, ThemeToggle
│   ├── providers/                # ThemeProvider
│   └── invoice/                  # 견적서 관련 컴포넌트
│
├── lib/
│   ├── notion.ts                 # @notionhq/client 싱글톤
│   ├── session.ts                # 쿠키 기반 세션 관리 (서버 전용)
│   ├── token.ts                  # 토큰 생성/검증 유틸리티
│   ├── format.ts                 # 금액, 날짜 포맷팅
│   └── utils.ts                  # cn() 클래스 병합
│
├── hooks/
│   ├── use-pdf-download.ts       # PDF 다운로드 (클라이언트 전용)
│   └── use-copy-to-clipboard.ts  # 클립보드 복사
│
├── types/
│   ├── invoice.ts                # Invoice 관련 타입
│   ├── token.ts                  # Token 관련 타입
│   ├── auth.ts                   # Auth 관련 타입
│   └── index.ts                  # 통합 내보내기
│
├── actions/
│   ├── auth.ts                   # 로그인/로그아웃 서버 액션
│   └── token.ts                  # 토큰 생성/무효화 서버 액션
│
└── docs/
    ├── PRD.md                    # 제품 요구사항 명세서
    └── ROADMAP.md                # 개발 로드맵
```

### 핵심 데이터 흐름

```
관리자 로그인
  ↓
세션 생성 (lib/session.ts)
  ↓
관리자 대시보드 접근
  ↓
노션 API 호출 (lib/notion.ts via actions/*)
  ↓
견적서 조회 및 관리
  ↓
토큰 생성 (actions/token.ts)
  ↓
클라이언트에게 공유 링크 제공
  ↓
클라이언트 토큰 검증 (lib/token.ts)
  ↓
견적서 열람 및 PDF 다운로드 (use-pdf-download.ts)
```

---

## 3. 코드 표준

### 명명 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| **파일명** | kebab-case | `invoice-card.tsx`, `use-pdf-download.ts` |
| **디렉토리명** | kebab-case | `invoice-list`, `shared-components` |
| **변수/함수** | camelCase | `const invoiceList = []`, `function getInvoice()` |
| **상수** | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE = 5242880` |
| **React 컴포넌트** | PascalCase | `export function InvoiceCard()` |
| **타입/인터페이스** | PascalCase | `type Invoice = {}`, `interface InvoiceItem {}` |

### 포맷팅
- **들여쓰기**: 스페이스 2칸 (탭 금지)
- **라인 길이**: 가능한 100자 이내
- **세미콜론**: 필수
- **따옴표**: 더블 쿼트(`"`) 기본, JSX에서는 작은 따옴표(`'`)

### 주석 규칙
- **인라인 주석**: 한국어 사용
- **함수 주석**: JSDoc 형식, 한국어
- **TODO 주석**: `// TODO: 설명` 형식
- **주석이 필요 없는 경우**: 명확한 변수/함수명으로 자명한 경우 생략 가능

```typescript
// 좋은 예: 한국어 주석
// 토큰으로부터 사용자 ID 추출
function extractUserIdFromToken(token: string): string {
  return jwt.decode(token).userId;
}

// 나쁜 예: 영어 주석이나 불필요한 주석
// Get the user ID from token
// This function extracts the user ID
```

---

## 4. 기능 구현 표준

### React 컴포넌트 작성

**서버 컴포넌트 (기본)**
```typescript
// 세션 검증이 필요한 관리자 페이지
import { getSession } from "@/lib/session";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <div>관리자 대시보드</div>;
}
```

**클라이언트 컴포넌트 (필요할 때만)**
```typescript
"use client";

import { useState } from "react";

export function InvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);

  return <form>...</form>;
}
```

**금지 사항**
- ❌ 불필요한 `"use client"` 선언
- ❌ `"use client"` 파일에서 `lib/notion.ts`, `lib/session.ts` import
- ❌ 환경변수 클라이언트 노출
- ❌ `any` 타입 사용

### 서버/클라이언트 분리 규칙

| 작업 | 위치 | 이유 |
|------|------|------|
| 노션 API 호출 | 서버 액션 or 서버 컴포넌트 | API 키 보안 |
| 환경변수 접근 | 서버 사이드만 | 보안 |
| 세션/토큰 검증 | 서버 사이드 | 보안 |
| UI 상호작용 | 클라이언트 컴포넌트 | 필수 |
| PDF 생성 | 클라이언트 훅 (`use-pdf-download.ts`) | 라이브러리 제약 |

### API 호출 패턴

```typescript
// ❌ 나쁜 예: 클라이언트에서 직접 호출
"use client";
const invoices = await notion.getInvoices(); // 불가능

// ✅ 좋은 예: 서버 액션 사용
// actions/invoice.ts
"use server";
export async function getInvoices() {
  return notion.getInvoices();
}

// app/(admin)/invoices/page.tsx
import { getInvoices } from "@/actions/invoice";
export default async function InvoicesList() {
  const invoices = await getInvoices();
  return <div>{invoices.length}</div>;
}
```

---

## 5. 외부 라이브러리 사용 표준

### TailwindCSS v4
- **설정파일 없음** - CSS 기반 설정
- **스타일 정의**: `app/globals.css`의 `@theme inline` 블록
- **커스텀 색상**: OKLCH 값 사용 (다크/라이트 모드 균형)
- **다크 모드**: `@custom-variant dark (&:is(.dark *))` 사용

```css
/* app/globals.css */
@theme inline {
  --color-primary: oklch(0.7 0.15 200);
  --radius-sm: 8px;
}
```

### shadcn/ui
- **스타일**: New York style 고정
- **RSC**: React Server Components 활성화
- **아이콘**: Lucide icons 사용
- **설치**: `npx shadcn@latest add [component-name]`

**컴포넌트 사용 예**
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### React Hook Form + Zod
- **폼 검증**: Zod 스키마 우선
- **에러 처리**: React Hook Form의 error 객체 활용

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(8, "8자 이상 입력하세요"),
});

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(loginSchema) });
  // ...
}
```

### Zustand (상태관리)
- **저장소**: `hooks/use-*.ts` 형식
- **용도**: 공유 상태 관리 (필요시에만)

```typescript
// hooks/use-invoice-store.ts
import { create } from "zustand";

export const useInvoiceStore = create((set) => ({
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),
}));
```

---

## 6. 워크플로우 표준

### 새 페이지 생성 흐름

```
1. types/new-feature.ts에 타입 정의
   ↓
2. app/(admin)/new-page/page.tsx 생성
   - 서버 컴포넌트 (기본)
   - 세션 검증 (관리자 페이지인 경우)
   ↓
3. 필요시 components/new-feature/로 UI 컴포넌트 분리
   ↓
4. 필요시 actions/new-feature.ts에 서버 액션 작성
   ↓
5. 노션 API 필요시 lib/notion.ts 확장
```

### 새 컴포넌트 생성 흐름

```
1. 타입 정의 (props 인터페이스)
   ↓
2. 서버/클라이언트 판단
   - 상호작용 없음 → 서버 컴포넌트
   - useState/이벤트 있음 → "use client"
   ↓
3. TailwindCSS로 스타일 (스타일 시트 금지)
   ↓
4. 반응형 설계 (모바일 우선)
   ↓
5. 다크 모드 지원 확인
```

### 타입 정의 흐름

```
1. types/ 폴더에서 관련 타입 정의
   ↓
2. types/index.ts에 내보내기 추가
   ↓
3. 모든 참조 위치에서 통일된 타입 사용
   - components/*
   - actions/*
   - app/pages
```

---

## 7. 핵심 파일 상호작용 표준

### 노션 API 흐름
```
lib/notion.ts (싱글톤 클라이언트)
  ↓
actions/invoice.ts (서버 액션 함수)
  ↓
app/(admin)/invoices/page.tsx (페이지에서 호출)
```

**규칙:**
- `lib/notion.ts`는 서버 전용 (클라이언트에서 import 금지)
- `actions/`의 모든 파일은 `"use server"` 선언
- 페이지에서는 항상 서버 액션을 통해 호출

### 세션 검증 흐름
```
lib/session.ts (세션 관리)
  ↓
app/(admin)/layout.tsx (레이아웃에서 검증)
  ↓
app/(admin)/* (모든 하위 페이지 보호됨)
```

**규칙:**
- 관리자 페이지에서는 `(admin)` 라우트 그룹 사용
- `lib/session.ts`는 서버 전용

### 토큰 검증 흐름
```
lib/token.ts (토큰 생성/검증)
  ↓
actions/token.ts (서버 액션)
  ↓
app/invoice/[token]/page.tsx (클라이언트 검증)
```

**규칙:**
- 토큰 생성은 서버 액션을 통해
- 클라이언트 페이지는 토큰 검증 후 접근
- 토큰 만료는 `lib/token.ts`에서 처리

### 타입 일관성
```
types/invoice.ts 정의
  ↓
components/invoice/에서 import
  ↓
actions/invoice.ts에서 import
  ↓
app/pages에서 import
```

**규칙:**
- 모든 타입은 `types/` 폴더에서 정의
- `types/index.ts`에서 통합 export
- 타입 수정시 모든 참조 위치 확인

---

## 8. AI 의사결정 기준

### 보안 판단 트리
```
"이 데이터/코드가 클라이언트 번들에 포함되면 위험한가?"

YES → 서버 사이드 (서버 액션, 서버 컴포넌트)
NO  → 클라이언트 컴포넌트 가능
```

**서버 사이드 필수:**
- 환경변수 (NOTION_API_KEY, ADMIN_PASSWORD)
- 노션 API 호출
- 세션/토큰 검증 로직
- 데이터베이스 접근

### 컴포넌트 분리 판단
```
크기/복잡도가 큰가?     → 분리
재사용 가능한가?       → 분리
UI/로직 혼합되었는가?   → 로직 분리 (훅/액션)

작고 재사용 불가?      → 함께 유지
```

### 상태관리 도구 선택
```
공유 상태인가? → Zustand
일회성 상태?  → useState
서버 상태?   → useTransition + 서버 액션
```

---

## 9. 금지 사항 ❌

| 금지 항목 | 이유 | 대안 |
|----------|------|------|
| 클라이언트에서 `lib/notion.ts` import | 보안 (API 키 노출) | 서버 액션 사용 |
| 클라이언트에서 `lib/session.ts` import | 보안 (세션 데이터 노출) | 서버 컴포넌트에서 호출 |
| 환경변수를 `process.env`로 클라이언트에서 접근 | 보안 (번들에 포함) | 서버 액션으로 전달 |
| `"use client"`를 모든 컴포넌트에 무분별하게 선언 | 성능 (JS 번들 크기 증가) | 필요할 때만 |
| `any` 타입 사용 | 타입 안정성 | 정확한 타입 정의 |
| 임의의 `console.log` 포함 | 프로덕션 문제 | 개발 중 제거 |
| CSS 모듈 또는 inline styles (TailwindCSS 있을 때) | 일관성 | TailwindCSS 사용 |
| 노션 API 응답을 그대로 사용 | 타입 안정성 | types 정의 후 사용 |
| 다크 모드 미지원 | 사용자 경험 | 모든 컴포넌트에서 다크 모드 지원 |
| 반응형 디자인 미적용 | 사용자 경험 | Tailwind breakpoint 활용 |

---

## 10. 개발 체크리스트

### 새 기능 구현 시
- [ ] 타입 정의 완료 (`types/` 폴더)
- [ ] 서버/클라이언트 분리 확인
- [ ] 보안 검토 완료 (환경변수, API 키 노출 확인)
- [ ] TailwindCSS로 스타일링
- [ ] 다크 모드 지원 확인
- [ ] 반응형 디자인 확인
- [ ] TypeScript 타입 에러 없음
- [ ] 한국어 주석 추가
- [ ] 테스트 케이스 작성 (필요시)

### 커밋 전
- [ ] `npm run lint` 통과
- [ ] `npx tsc --noEmit` 타입 체크 통과
- [ ] 콘솔.log 제거
- [ ] 커밋 메시지: 영어 + conventional commits
- [ ] 한국어 주석 확인

---

## 11. 참조 문서

- **프로젝트 요구사항**: `docs/PRD.md`
- **개발 로드맵**: `docs/ROADMAP.md`
- **프로젝트 규칙**: `CLAUDE.md`
