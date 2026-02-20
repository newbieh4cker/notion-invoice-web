# CLAUDE.md

**노션 연동 온라인 견적서**는 프리랜서/소규모 사업자가 노션에 작성한 견적서를 클라이언트가 로그인 없이 웹에서 조회하고 PDF로 다운로드할 수 있는 MVP 서비스입니다.

상세 프로젝트 요구사항은 @/docs/PRD.md 참조

이 파일은 이 레포지토리에서 Claude Code (claude.ai/code)가 작업할 때 필요한 지침을 제공합니다.

## 개발 명령어

```bash
# Turbopack을 사용한 개발 서버 실행
npm run dev

# Turbopack을 사용한 프로덕션 빌드  
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]
```

## 아키텍처 개요

이 프로젝트는 **노션 연동 온라인 견적서 MVP**로, App Router 아키텍처를 사용하여 구축되었습니다. 주요 특징:

### TailwindCSS v4 설정
- **tailwind.config 파일 없음** - CSS 기반 설정 사용
- `app/globals.css`에 `@theme inline` 블록으로 스타일 정의
- 커스텀 다크 모드 variant: `@custom-variant dark (&:is(.dark *))`
- PostCSS는 `@tailwindcss/postcss` 플러그인만 사용하도록 설정
- 추가 애니메이션을 위한 `tw-animate-css` 사용
- 라이트/다크 테마 모두에 OKLCH 값을 사용하는 색상 시스템

### 컴포넌트 아키텍처
- **shadcn/ui 컴포넌트**: `components/ui/`에 위치 (New York 스타일, RSC 활성화, Lucide 아이콘)
- **레이아웃 컴포넌트**: `components/layout/`에 위치 (navbar, footer, theme-toggle)
- **프로바이더**: `components/providers/`에 위치 (테마 프로바이더 래퍼)
- **유틸리티 함수**: `lib/utils.ts`에 위치 (클래스 병합을 위한 cn 함수)
- **컴포넌트 설정**: 커스텀 별칭이 포함된 `components.json`을 통해 관리

### 테마 시스템
- 시스템 감지가 활성화된 `next-themes` 사용
- `attribute="class"` 및 `defaultTheme="system"`으로 설정된 ThemeProvider
- 한국어 라벨(라이트, 다크, 시스템)로 라이트/다크/시스템 옵션을 제공하는 테마 토글 컴포넌트
- 테마 지속성을 위해 루트 레이아웃에 `suppressHydrationWarning` 포함

### 레이아웃 구조
- 루트 레이아웃(`app/layout.tsx`)이 모든 페이지를 ThemeProvider로 감쌈
- **관리자 라우트 그룹** `app/(admin)/`: Navbar + Footer 포함, 로그인 필요
- **클라이언트 라우트** `app/invoice/[token]/`: Navbar 없음, 토큰 기반 접근
- **로그인 페이지** `app/login/`: Navbar 없음, 단독 레이아웃
- HTML에 한국어 설정(`lang="ko"`)
- CSS 변수를 사용하는 Geist 폰트(sans 및 mono)

### 스타일링 패턴
- 일관된 중앙 정렬을 위해 모든 컨테이너에 `mx-auto max-w-screen-2xl px-4` 사용
- OKLCH 색상 값으로 라이트/다크 모드 간 더 나은 지각적 균일성 제공
- `cn()` 유틸리티로 클래스 조합하는 shadcn/ui 패턴을 따르는 컴포넌트
- Border radius 시스템: 기본값 `10px`로 `--radius-sm`부터 `--radius-xl`까지

## 환경 설정

환경변수를 위해 `.env.example`을 `.env.local`로 복사하세요. 노션 API 키, 데이터베이스 ID, 관리자 계정 정보가 필요합니다.

## Import 별칭

- `@/components` → `./components`
- `@/lib` → `./lib`  
- `@/app` → `./app`
- `@/ui` → `./components/ui`
- `@/hooks` → `./hooks`
- `@/` → `./` (루트)

## 프로젝트별 주요 규칙

### 디렉토리 역할
- `actions/` - 서버 액션 파일 (auth.ts, token.ts, invoice.ts)
- `types/` - TypeScript 타입 정의 (invoice.ts, token.ts, auth.ts)
- `lib/notion.ts` - 노션 API 클라이언트 (서버 사이드 전용)
- `lib/session.ts` - 쿠키 기반 세션 관리 (서버 사이드 전용)
- `lib/token.ts` - 토큰 생성/검증 유틸리티
- `lib/format.ts` - 금액, 날짜 포맷팅 유틸리티
- `hooks/use-pdf-download.ts` - PDF 다운로드 훅 (클라이언트 전용)
- `components/invoice/` - 견적서 관련 컴포넌트

### 서버/클라이언트 구분
- 노션 API 호출은 반드시 서버 컴포넌트 또는 서버 액션에서만 실행
- `lib/notion.ts`, `lib/session.ts`는 서버 사이드 전용 (클라이언트 import 금지)
- PDF 생성 (`use-pdf-download.ts`)은 `"use client"` 전용

### 보안 규칙
- 관리자 페이지 접근 시 반드시 세션 검증 (`lib/session.ts`)
- 클라이언트 견적서 접근 시 반드시 토큰 유효성 검증 (`lib/token.ts`)
- 환경변수 `NOTION_API_KEY`, `ADMIN_PASSWORD`는 절대 클라이언트에 노출 금지

## 한국어 지원

이 프로젝트는 한국어를 위해 설정되었습니다:
- HTML lang 속성을 "ko"로 설정
- 한국어 라벨(라이트, 다크, 시스템)이 포함된 테마 토글
- 한국어 설명이 포함된 환경변수
- 한국어로 작성된 README 및 문서