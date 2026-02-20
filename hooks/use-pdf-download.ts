"use client"

import { useState, useCallback } from "react"

interface UsePdfDownloadOptions {
  filename?: string
}

interface UsePdfDownloadReturn {
  isGenerating: boolean
  downloadPdf: (elementId: string) => Promise<void>
}

/**
 * PDF 다운로드 커스텀 훅 (F004)
 * html2canvas + jspdf를 사용하여 DOM 요소를 PDF로 변환
 */
export function usePdfDownload({
  filename = "견적서.pdf",
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
          import("html2canvas"),
          import("jspdf"),
        ])

        const canvas = await html2canvas(element, {
          scale: 2, // 고해상도 출력
          useCORS: true,
          logging: false,
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pageWidth
        const imgHeight = (canvas.height * pageWidth) / canvas.width

        // 여러 페이지 처리
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        pdf.save(filename)
      } catch (error) {
        console.error("PDF 생성 실패:", error)
        throw error
      } finally {
        setIsGenerating(false)
      }
    },
    [filename]
  )

  return { isGenerating, downloadPdf }
}
