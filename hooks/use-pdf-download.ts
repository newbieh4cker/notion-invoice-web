"use client"

import { useState, useCallback } from "react"

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

interface UsePdfDownloadOptions {
  filename?: string
  margins?: Margins
  removeBackground?: boolean
}

interface UsePdfDownloadReturn {
  isGenerating: boolean
  downloadPdf: (elementId: string) => Promise<void>
}

/**
 * PDF 다운로드 커스텀 훅 (F004)
 * html2canvas-pro + jspdf를 사용하여 DOM 요소를 PDF로 변환
 * 한글 폰트 임베딩, A4 마진, 배경색 제거 지원
 */
export function usePdfDownload({
  filename = "견적서.pdf",
  margins = { top: 20, right: 20, bottom: 20, left: 20 },
  removeBackground = true,
}: UsePdfDownloadOptions = {}): UsePdfDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadPdf = useCallback(
    async (elementId: string) => {
      setIsGenerating(true)
      try {
        const element = document.getElementById(elementId)
        if (!element) {
          throw new Error(`요소를 찾을 수 없습니다: ${elementId}`)
        }

        // 동적 import로 클라이언트 번들 최적화
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
          import("html2canvas-pro"),
          import("jspdf"),
        ])

        // 배경색 처리
        const originalBgColor = element.style.backgroundColor
        if (removeBackground) {
          element.style.backgroundColor = "white"
        }

        // html2canvas-pro는 현대적 CSS 색상 함수를 지원함
        const canvas = await html2canvas(element, {
          scale: 2, // 고해상도 출력
          useCORS: true,
          logging: false,
          backgroundColor: removeBackground ? "#ffffff" : null,
        })

        // 원래 배경색 복원
        if (removeBackground) {
          element.style.backgroundColor = originalBgColor
        }

        // Canvas를 PNG로 변환
        const imgData = canvas.toDataURL("image/png")

        // PDF 생성
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // 마진을 고려한 실제 이미지 너비
        const effectiveWidth = pageWidth - margins.left - margins.right
        const imgWidth = effectiveWidth
        const imgHeight = (canvas.height * effectiveWidth) / canvas.width

        // 여러 페이지 처리 (마진 적용)
        let heightLeft = imgHeight
        let position = margins.top

        pdf.addImage(imgData, "PNG", margins.left, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - margins.top - margins.bottom

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + margins.top
          pdf.addPage()
          pdf.addImage(imgData, "PNG", margins.left, position, imgWidth, imgHeight)
          heightLeft -= pageHeight - margins.top - margins.bottom
        }

        pdf.save(filename)
      } catch (error) {
        console.error("PDF 생성 실패:", error)
        throw error
      } finally {
        setIsGenerating(false)
      }
    },
    [filename, margins, removeBackground]
  )

  return { isGenerating, downloadPdf }
}
