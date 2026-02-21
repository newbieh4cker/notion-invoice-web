/**
 * PDF 생성용 한글 폰트 관리
 * Noto Sans KR 웹폰트를 base64로 변환하여 jsPDF에 임베딩
 */

import axios from 'axios'

interface FontData {
  name: string
  base64: string
  weight: number
  style: 'normal' | 'italic'
}

// 폰트 캐싱
let fontCache: FontData | null = null

/**
 * Google Fonts CDN에서 Noto Sans KR 한글 폰트 로드
 * base64로 변환하여 jsPDF 임베딩 가능한 형태로 변환
 */
export async function getKoreanFont(): Promise<FontData> {
  // 캐시 확인
  if (fontCache) {
    return fontCache
  }

  try {
    // Noto Sans KR Regular (400) 한글 전용 서브셋
    // 이 URL은 한글 문자만 포함한 최적화된 폰트입니다
    const fontUrl =
      'https://fonts.gstatic.com/s/notosansKR/v13/-F6ofjtqLzI2JPCgQBnw7zFQdGZD8cWe.woff2'

    // 폰트 파일 다운로드
    const response = await axios.get(fontUrl, {
      responseType: 'arraybuffer',
      timeout: 5000, // 5초 타임아웃
    })

    // ArrayBuffer를 base64로 변환
    const base64 = Buffer.from(response.data).toString('base64')

    fontCache = {
      name: 'NotoSansKR',
      base64,
      weight: 400,
      style: 'normal',
    }

    return fontCache
  } catch (error) {
    console.error('한글 폰트 로드 실패:', error)

    // 폴백: 시스템 기본 폰트 사용
    // jsPDF는 기본적으로 라틴 문자만 지원하므로
    // 실패 시 null을 반환하고 호출 측에서 처리
    throw new Error('폰트를 로드할 수 없습니다. 나중에 다시 시도해주세요.')
  }
}

/**
 * 폰트 캐시 초기화 (테스트용)
 */
export function clearFontCache(): void {
  fontCache = null
}
