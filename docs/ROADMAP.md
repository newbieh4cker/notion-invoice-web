# 노션 연동 온라인 견적서 - 고도화 로드맵

MVP 완료 후 관리자 경험 개선 및 견적서 목록 사용성 향상을 위한 고도화 개발 로드맵

## 개요

MVP(Phase 1~5) 개발이 완료된 상태에서, 다음 두 가지 핵심 목표를 달성합니다:

- **관리자 레이아웃 개선**: 대시보드 기능 확장, UI/UX 다듬기, 필터링/검색 고도화
- **견적서 목록 페이지네이션**: 현재 전체 목록 표시에서 5개씩 페이지네이션으로 변경, 페이지 번호 네비게이션 UI 추가

## 현재 상태 (MVP 완료)

- Phase 1~5 전체 완료
- E2E 테스트 38/38 통과
- 노션 API cursor 기반 20건 페이지네이션 구현 완료 (이전/다음 버튼만 존재)
- 관리자 대시보드: 통계 카드 4개 + 최근 견적서 5건 테이블

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `027-pagination.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료로 표시

---

## 개발 단계

### Phase 6: 관리자 경험 고도화

- **Task 027: 견적서 목록 페이지네이션 개선 (5개씩)** - 우선순위
  - 현재 노션 API cursor 기반 20건 페이지네이션을 클라이언트 사이드 5건 페이지네이션으로 변경
  - 페이지 번호 네비게이션 UI 구현 (1, 2, 3 ... 형태의 페이지 버튼)
  - 필터/검색 결과에도 페이지네이션 적용 (필터 변경 시 1페이지로 리셋)
  - URL 쿼리 파라미터로 페이지 상태 유지 (`?page=2`)
  - 총 건수 및 총 페이지 수 표시
  - 관련 파일:
    - `components/invoice/invoices-pagination.tsx` - 페이지네이션 컴포넌트 전면 재작성
    - `components/invoice/invoice-list-container.tsx` - 페이지네이션 로직 통합
    - `components/invoice/invoice-table.tsx` - 페이지당 5건 슬라이싱
    - `app/(admin)/invoices/page.tsx` - 페이지 파라미터 처리 수정
    - `stores/invoice-store.ts` - 현재 페이지 상태 추가
  - ## 테스트 체크리스트
    - Playwright MCP로 견적서 목록 페이지에서 5개씩 표시되는지 확인
    - 페이지 번호 클릭 시 해당 페이지로 이동 확인
    - 필터 변경 시 1페이지로 리셋되는지 확인
    - 검색 결과에도 페이지네이션 정상 동작 확인
    - URL에 페이지 상태가 반영되는지 확인

- **Task 028: 대시보드 기능 확장**
  - 통계 카드에 전월 대비 변화율 표시 (증가/감소 화살표 + 퍼센트)
  - 월별 견적서 발행 추이 차트 추가 (최근 6개월, 간단한 바 차트 또는 라인 차트)
  - 최근 활동 피드 추가 (견적서 생성, 상태 변경, 클라이언트 열람 등 타임라인)
  - 빠른 액션 영역 추가 (자주 사용하는 기능 바로가기)
  - 관련 파일:
    - `components/dashboard/stats-cards.tsx` - 변화율 표시 추가
    - `components/dashboard/monthly-chart.tsx` - 신규 생성 (월별 추이 차트)
    - `components/dashboard/activity-feed.tsx` - 신규 생성 (최근 활동 피드)
    - `components/dashboard/quick-actions.tsx` - 신규 생성 (빠른 액션)
    - `app/(admin)/dashboard/page.tsx` - 새 컴포넌트 통합

- **Task 029: 필터링 및 검색 고도화**
  - 다중 필터 지원 (상태 + 날짜 범위 + 금액 범위 동시 적용)
  - 날짜 범위 필터 추가 (shadcn/ui Calendar + Popover 기반 DateRangePicker)
  - 금액 범위 필터 추가 (최소/최대 금액 입력)
  - 검색 디바운스 적용 (300ms, 타이핑 중 불필요한 필터링 방지)
  - 필터 초기화 버튼 추가
  - 활성 필터 태그 표시 (적용 중인 필터를 Badge로 표시, 개별 제거 가능)
  - 관련 파일:
    - `components/invoice/invoice-filters.tsx` - 다중 필터 UI로 확장
    - `components/invoice/date-range-filter.tsx` - 신규 생성 (날짜 범위 필터)
    - `components/invoice/amount-range-filter.tsx` - 신규 생성 (금액 범위 필터)
    - `components/invoice/active-filters.tsx` - 신규 생성 (활성 필터 태그)
    - `components/invoice/invoice-search.tsx` - 디바운스 로직 추가
    - `stores/invoice-store.ts` - 다중 필터 상태 확장
  - ## 테스트 체크리스트
    - Playwright MCP로 날짜 범위 필터 적용 후 결과 확인
    - 금액 범위 필터 적용 후 결과 확인
    - 다중 필터 동시 적용 시 정상 동작 확인
    - 필터 초기화 버튼 동작 확인
    - 활성 필터 태그에서 개별 필터 제거 확인

- **Task 030: 관리자 레이아웃 UI/UX 개선**
  - Navbar 브레드크럼 추가 (현재 위치 경로 표시: 대시보드 > 견적서 목록 > INV-2026-001)
  - 사이드바 네비게이션 옵션 추가 (데스크탑에서 사이드바 토글 가능)
  - 테이블 행 호버 효과 및 선택 상태 시각화 개선
  - 빈 상태 일러스트레이션 개선 (Lucide 아이콘 + 안내 메시지 강화)
  - 페이지 전환 애니메이션 추가 (부드러운 fade-in 효과)
  - 관련 파일:
    - `components/layout/navbar.tsx` - 브레드크럼 통합
    - `components/layout/breadcrumb.tsx` - 신규 생성
    - `components/layout/sidebar.tsx` - 신규 생성 (선택적 사이드바)
    - `app/(admin)/layout.tsx` - 레이아웃 구조 개선
    - `components/common/empty-state.tsx` - 일러스트레이션 개선

- **Task 031: Phase 6 통합 테스트**
  - 전체 관리자 플로우 E2E 테스트 (대시보드 -> 목록 -> 상세 -> 공유 관리)
  - 페이지네이션 + 필터 + 검색 조합 테스트
  - 반응형 디자인 검증 (모바일 375px, 태블릿 768px, 데스크탑 1280px+)
  - 다크 모드/라이트 모드 전체 신규 컴포넌트 시각적 검증
  - 관련 파일:
    - 모든 신규/수정 컴포넌트
  - ## 테스트 체크리스트
    - Playwright MCP로 대시보드 신규 위젯 렌더링 확인
    - 견적서 목록 5건 페이지네이션 전체 플로우 테스트
    - 다중 필터 + 페이지네이션 조합 테스트
    - 모바일/태블릿/데스크탑 반응형 레이아웃 확인
    - 브레드크럼 네비게이션 정상 동작 확인
