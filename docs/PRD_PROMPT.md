# PRD 메타 프롬프트: 노션 연동 온라인 견적서 조회 및 PDF 다운로드 MVP

## 📋 프롬프트 엔지니어 가이드

다음 요구사항을 기반으로 실제 PRD(Product Requirements Document)를 작성할 때 사용하는 메타 프롬프트입니다.

---

## 🎯 MVP 핵심 요구사항

### 메인 기능
1. **견적서 조회**
   - 노션 데이터베이스에서 견적서 데이터 조회
   - 웹 UI에서 견적서 목록 및 상세 정보 표시
   - 클라이언트는 공유받은 링크로 자신의 견적서만 조회 가능

2. **PDF 다운로드**
   - 웹에서 보고 있는 견적서를 PDF로 다운로드
   - 현재 보고 있는 견적서 상태를 그대로 PDF에 반영
   - 한글 폰트 정상 표시

3. **인증 및 접근 제어**
   - 클라이언트는 공유받은 링크로만 접근 가능
   - 관리자는 모든 견적서 조회 및 관리 가능
   - 토큰 기반 임시 접근 링크 방식

---

## 🏗️ 기술 스택 요구사항

### 프론트엔드
```
- Framework: Next.js 15.5.3 (App Router + Turbopack)
- UI Library: React 19 + TypeScript 5
- Styling: TailwindCSS v4 + shadcn/ui (new-york)
- Forms: React Hook Form + Zod
- State Management: Zustand
- Icons: Lucide Icons
- PDF Export: react-pdf / html2pdf (검토 필요)
```

### 백엔드 / API
```
- Next.js Server Actions 우선 (필요시 API routes)
- 노션 API 통합 (notion-client SDK)
- 데이터 캐싱 전략 필요
- 환경변수 기반 설정 (NOTION_API_KEY, NOTION_DATABASE_ID 등)
```

### 데이터베이스 / 저장소
```
- 노션 데이터베이스 구조 설계
  - 견적서 기본정보 (ID, 발행일, 유효기간, 금액 등)
  - 항목 리스트 (상품/서비스, 수량, 단가, 합계)
  - 클라이언트 정보 (이름, 이메일, 전화 등)
  - 접근 토큰 / 링크 관리 테이블
```

---

## 📐 페이지 구조 (App Router)

### 관리자 페이지
```
src/app/admin/
├── page.tsx                    # 대시보드
├── layout.tsx                  # 관리자 레이아웃
├── invoices/
│   ├── page.tsx               # 견적서 목록
│   ├── [id]/
│   │   ├── page.tsx           # 견적서 상세 조회
│   │   ├── edit/page.tsx      # 견적서 수정
│   │   └── share/page.tsx     # 공유 링크 생성
│   └── create/page.tsx        # 견적서 생성
└── settings/page.tsx          # 관리 설정
```

### 클라이언트 페이지
```
src/app/
├── page.tsx                    # 홈페이지
├── invoice/
│   ├── [token]/
│   │   └── page.tsx           # 공유받은 견적서 조회
│   └── preview/               # 미리보기 페이지
└── auth/
    ├── login/page.tsx
    └── logout/page.tsx
```

---

## 🧩 핵심 컴포넌트

### 관리자 기능
- `InvoiceList` - 견적서 목록 테이블 / 그리드
- `InvoiceDetail` - 상세 조회 및 수정 폼
- `InvoiceForm` - 견적서 생성/수정 폼
- `ShareModal` - 공유 링크 생성 및 복사
- `InvoicePreview` - PDF 미리보기

### 클라이언트 기능
- `InvoiceViewer` - 견적서 열람 컴포넌트
- `PDFExportButton` - PDF 다운로드 버튼
- `InvoiceHeader` - 견적서 헤더 (회사 정보)
- `InvoiceItems` - 항목 테이블
- `InvoiceSummary` - 합계 섹션

### 공유 컴포넌트
- `ShareLinkGenerator` - 토큰 기반 링크 생성
- `AccessTokenManager` - 토큰 유효기간 관리
- `ProtectedRoute` - 토큰 검증 라우트

---

## 💾 데이터 구조

### 견적서 (Invoice)
```typescript
{
  id: string                      // 고유 ID
  invoiceNumber: string           // 견적서 번호
  clientName: string              // 클라이언트명
  clientEmail: string             // 이메일
  clientPhone: string             // 전화번호
  issueDate: Date                 // 발행일
  expiryDate: Date                // 유효기간
  companyName: string             // 발행사 정보
  items: InvoiceItem[]            // 항목 리스트
  totalAmount: number             // 합계
  notes?: string                  // 비고
  status: 'draft' | 'sent' | 'viewed' | 'paid'
  createdAt: Date
  updatedAt: Date
}

interface InvoiceItem {
  id: string
  description: string             // 상품/서비스명
  quantity: number
  unitPrice: number
  totalPrice: number              // quantity * unitPrice
}
```

### 접근 토큰
```typescript
{
  id: string
  invoiceId: string               // 견적서 ID
  token: string                   // 고유 토큰
  clientEmail: string             // 클라이언트 이메일
  expiresAt: Date                 // 만료일
  createdAt: Date
  lastAccessedAt?: Date
  isRevoked: boolean
}
```

---

## 🔐 인증 및 보안

### 클라이언트 접근
- URL 토큰 기반 일회성 링크 (예: `/invoice/abc123token`)
- 토큰 유효기간 설정 (기본 30일)
- 토큰 만료 시 접근 불가

### 관리자 접근
- 관리자 계정 로그인 필수
- 세션 기반 인증 (추후 OAuth 가능)
- 모든 견적서 조회 권한

### 보안 고려사항
- 토큰은 안전한 난수 생성
- 토큰 재사용 방지
- HTTPS 필수
- Rate limiting (향후)

---

## 📊 주요 API / Server Action

### 관리자 API
```typescript
// 견적서 조회
getInvoices()                 // 전체 목록
getInvoiceById(id)           // 상세 조회

// 견적서 생성/수정
createInvoice(data)
updateInvoice(id, data)
deleteInvoice(id)

// 공유 링크 관리
generateShareToken(invoiceId, clientEmail)
revokeShareToken(tokenId)
```

### 클라이언트 API
```typescript
// 공개 조회 (토큰 기반)
getInvoiceByToken(token)     // 토큰으로 견적서 조회
```

### PDF 생성
```typescript
generateInvoicePDF(invoiceId) // PDF 생성 및 다운로드
```

---

## 🎨 UI/UX 요구사항

### 관리자 화면
- [ ] 견적서 목록 테이블 (검색, 필터링, 정렬)
- [ ] 상세 조회/수정 폼 (모달 또는 페이지)
- [ ] 공유 링크 생성 팝업
- [ ] 다크모드 / 라이트모드 지원
- [ ] 반응형 디자인 (모바일 미지원 OK for MVP)

### 클라이언트 화면
- [ ] 깔끔한 견적서 열람 UI
- [ ] PDF 다운로드 버튼
- [ ] 회사 로고 및 정보 표시
- [ ] 항목별 상세 정보 표시
- [ ] 합계 및 합산 정보 명확한 표시

---

## 🧪 테스트 계획

### 기능 테스트
- [ ] 노션에서 데이터 정상 조회
- [ ] 공유 토큰 생성 및 유효성 검증
- [ ] PDF 정상 생성 및 다운로드
- [ ] 토큰 만료 시 접근 불가

### 보안 테스트
- [ ] 유효하지 않은 토큰 접근 차단
- [ ] 타인의 견적서 접근 차단
- [ ] 토큰 재사용 방지

### 호환성 테스트
- [ ] 브라우저 호환성 (Chrome, Firefox, Safari)
- [ ] PDF 한글 폰트 정상 표시
- [ ] 반응형 디자인 검증

---

## 📅 MVP 릴리스 범위

### Phase 1: Core MVP
- ✅ 노션 연동 (읽기만)
- ✅ 관리자 대시보드 (리스트, 상세 조회)
- ✅ 공유 링크 생성
- ✅ 클라이언트 열람 페이지
- ✅ PDF 다운로드

### Phase 2: Enhancement (MVP 이후)
- 관리자 편집 기능
- 메일 발송 기능
- 통계/분석 대시보드
- 다중 관리자 권한 관리

---

## 🚀 배포 및 환경 설정

### 환경변수
```
NOTION_API_KEY=              # 노션 API 키
NOTION_DATABASE_ID=          # 견적서 DB ID
NOTION_TOKEN_DB_ID=          # 토큰 관리 DB ID
NEXT_PUBLIC_APP_URL=         # 애플리케이션 URL
JWT_SECRET=                  # 토큰 암호화 키 (선택사항)
```

### 배포 대상
- Vercel (권장) / AWS / 자체 서버
- 노션 API 접근 권한 필수

---

## 📝 문서화 체크리스트

- [ ] 노션 DB 스키마 문서화
- [ ] API 사양서 작성
- [ ] 사용자 가이드 (관리자용)
- [ ] 배포 가이드

---

## 🎓 참고 자료

### 기술 문서
- 프로젝트 가이드: `@/docs/guides/`
- Next.js 15.5.3: `@/docs/guides/nextjs-15.md`
- 폼 처리: `@/docs/guides/forms-react-hook-form.md`

### 외부 라이브러리
- [Notion JavaScript Client](https://developers.notion.com/reference/intro)
- [react-pdf](https://react-pdf.org/) 또는 [html2pdf](https://ekoopmans.github.io/html2pdf.js/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 📌 프롬프트 사용 방법

이 문서를 Claude Code에 전달하여 다음 작업을 수행합니다:

```bash
# 예시: 실제 PRD 생성 프롬프트
"이 PRD_PROMPT.md를 기반으로 구체적인 PRD 문서를 docs/PRD.md로 작성해줘.
 기술 스택, 페이지 흐름, 데이터베이스 스키마, API 명세를 포함해서.
 CLAUDE.md의 개발 지침을 모두 반영해줘."
```

그러면 Claude Code가:
1. 이 메타 프롬프트 분석
2. CLAUDE.md 개발 지침 적용
3. 구체적인 PRD 문서 생성
4. 필요한 파일 구조 설계
5. API 명세 작성
6. 구현 가이드 제공

---

**생성일**: 2026-02-19
**상태**: MVP 정의 단계
**작성자**: Claude Code Prompt Engineer
