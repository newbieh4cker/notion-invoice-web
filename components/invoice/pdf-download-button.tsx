"use client"

/**
 * PDF 다운로드 버튼 컴포넌트
 * use-pdf-download 훅 활용
 * 로딩 상태, 에러 처리, 토스트 알림 포함
 */

import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { usePdfDownload } from "@/hooks/use-pdf-download"

interface PdfDownloadButtonProps {
  /** PDF로 변환할 DOM 요소 ID */
  targetElementId: string
  /** 저장될 파일명 */
  filename: string
  /** 버튼 스타일 변형 */
  variant?: "default" | "outline" | "secondary"
  /** 버튼 크기 */
  size?: "default" | "sm" | "lg"
  /** 추가 클래스 */
  className?: string
}

export function PdfDownloadButton({
  targetElementId,
  filename,
  variant = "default",
  size = "default",
  className,
}: PdfDownloadButtonProps) {
  const { isGenerating, downloadPdf } = usePdfDownload({ filename })

  // PDF 다운로드 핸들러
  const handleDownload = async () => {
    try {
      await downloadPdf(targetElementId)
      toast.success("PDF가 다운로드되었습니다", {
        description: `파일명: ${filename}`,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "PDF 생성에 실패했습니다"
      console.error("PDF 다운로드 실패:", error)
      toast.error("PDF 다운로드 실패", {
        description: errorMessage || "다시 시도해주세요.",
      })
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
      aria-busy={isGenerating}
      aria-label={isGenerating ? "PDF 생성 중" : "PDF 다운로드"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          PDF 생성 중...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          PDF 다운로드
        </>
      )}
    </Button>
  )
}
