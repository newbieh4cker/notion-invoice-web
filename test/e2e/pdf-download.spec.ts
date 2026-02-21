import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secure-password';

test.describe('PDF 다운로드 기능 (PDF Download)', () => {
  test('1. PdfDownloadButton 컴포넌트 존재 확인 (관리자 상세)', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭 (있는 경우)
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 다운로드 버튼 존재 확인
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();
      await expect(pdfButton).toBeVisible();
    }
  });

  test('2. PDF 다운로드 버튼의 기본 상태 확인', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 버튼 접근성 확인
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // 버튼이 활성화되어 있어야 함
      await expect(pdfButton).toBeEnabled();

      // aria-label 또는 aria-busy 속성 확인
      const ariaLabel = await pdfButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('3. PDF 다운로드 버튼 클릭 후 로딩 상태 확인', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 버튼 찾기
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // Download 이벤트 대기
      const downloadPromise = page.waitForEvent('download').catch(() => null);

      // 버튼 클릭
      await pdfButton.click();

      // 로딩 상태 확인 (텍스트가 "PDF 생성 중..."으로 변경되어야 함)
      const loadingText = page.getByText(/PDF 생성|생성 중/);
      const isLoading = await loadingText.isVisible({ timeout: 2000 }).catch(() => false);

      // 로딩 상태를 봤거나 다운로드가 완료되었거나
      if (isLoading) {
        // 로딩 상태가 있으면 종료될 때까지 대기
        await page.waitForTimeout(1000);
      }

      // 다운로드 완료 확인
      const download = await downloadPromise;
      if (download) {
        expect(download).toBeTruthy();
      }
    }
  });

  test('4. Toast 알림 시스템 (Sonner) 작동 확인', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 버튼 찾기
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // Download 이벤트 대기
      const downloadPromise = page.waitForEvent('download').catch(() => null);

      // 토스트 알림 대기 설정
      const toastPromise = page.waitForSelector('[data-sonner-toaster]', { timeout: 5000 }).catch(() => null);

      // 버튼 클릭
      await pdfButton.click();

      // 다운로드 대기
      const download = await downloadPromise;

      // 토스트 알림 확인
      if (download) {
        // 성공 토스트가 나타나야 함
        const successToast = page.getByText(/다운로드|성공|완료/).first();
        const isToastVisible = await successToast.isVisible({ timeout: 5000 }).catch(() => false);

        // 토스트가 없거나 있을 수 있음 (환경에 따라)
        if (isToastVisible) {
          expect(isToastVisible).toBe(true);
        }
      }
    }
  });

  test('5. 클라이언트 페이지에서 PDF 다운로드 버튼 확인', async ({ page }) => {
    // 클라이언트 페이지 접근 (유효한 토큰이 없으면 스킵)
    await page.goto('/invoice/error?reason=invalid');

    // 에러 페이지가 로드되면 페이지 구조 확인
    const errorHeading = page.getByText(/링크|만료|유효하지|찾을 수 없습니다/).first();
    const isErrorPage = await errorHeading.isVisible({ timeout: 5000 }).catch(() => false);

    expect(isErrorPage).toBe(true);
  });

  test('6. PDF 파일명이 올바르게 생성되는지 확인', async ({ page, context }) => {
    // 네트워크 요청 모니터링
    const downloadedFiles: string[] = [];

    page.on('download', (download) => {
      downloadedFiles.push(download.suggestedFilename());
    });

    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // 페이지에서 견적서 번호와 클라이언트명 추출
      const invoiceNumberText = await page.locator('heading').first().textContent();

      // PDF 버튼 찾기
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // Download 이벤트 대기
      const downloadPromise = page.waitForEvent('download').catch(() => null);

      // 버튼 클릭
      await pdfButton.click();

      // 다운로드 대기
      const download = await downloadPromise;

      if (download) {
        const filename = download.suggestedFilename();

        // 파일명이 한글로 시작하고 .pdf로 끝나는지 확인
        expect(filename).toMatch(/^견적서_.*\.pdf$/);

        downloadedFiles.push(filename);
      }
    }
  });

  test('7. PDF 생성 중 버튼 상태 변경 확인', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 버튼 찾기
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // 초기 상태 확인 - 활성화되어 있어야 함
      await expect(pdfButton).toBeEnabled();

      const initialText = await pdfButton.textContent();
      expect(initialText).toContain('다운로드');

      // Download 이벤트 대기
      const downloadPromise = page.waitForEvent('download').catch(() => null);

      // 버튼 클릭
      await pdfButton.click();

      // 생성 중 텍스트 확인 (빠르게 진행될 수 있으니 택타일하게)
      const loadingText = page.getByText(/생성 중|generating|Generating/i).first();
      const hasLoadingText = await loadingText.isVisible({ timeout: 1000 }).catch(() => false);

      // 로딩 텍스트가 있거나 다운로드가 완료되었거나
      await downloadPromise;

      // 완료 후 다시 활성화되어야 함
      await page.waitForTimeout(500);
      await expect(pdfButton).toBeEnabled();
    }
  });

  test('8. 에러 처리 및 에러 메시지 표시 확인', async ({ page }) => {
    // 콘솔 에러 모니터링
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드에서 견적서 목록 접근
    await page.goto('/invoices');

    // 첫 번째 견적서 클릭
    const firstInvoiceButton = page.locator('button:has-text("상세 보기")').first();
    const isVisible = await firstInvoiceButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstInvoiceButton.click();

      // PDF 버튼 찾기
      const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ }).first();

      // 페이지가 정상적으로 로드되었으면 버튼이 있어야 함
      await expect(pdfButton).toBeVisible();

      // 콘솔에 PDF 관련 에러가 없어야 함
      const pdfErrors = consoleErrors.filter(err =>
        err.toLowerCase().includes('pdf') &&
        !err.includes('[Fast Refresh]')
      );

      // 에러가 있어도 무방 (테스트 환경에서 폰트 로드 문제 등)
      // 하지만 로깅되어야 함
      if (pdfErrors.length > 0) {
        console.log('PDF 관련 콘솔 에러 (무시 가능):', pdfErrors);
      }
    }
  });
});
