"use client"

import { useState, useCallback } from "react"

interface UseCopyToClipboardReturn {
  copied: boolean
  copyToClipboard: (text: string) => Promise<void>
}

/**
 * 클립보드 복사 커스텀 훅
 * 공유 링크 복사 기능에 사용
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 시 fallback
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return { copied, copyToClipboard }
}
