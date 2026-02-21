"use client"

/**
 * 이전 페이지로 이동하는 버튼 컴포넌트
 * 클라이언트 컴포넌트로 구현 (useRouter 사용)
 */

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  label?: string
  className?: string
}

export function BackButton({
  label = "이전 페이지",
  className,
}: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className={`gap-2 ${className ?? ""}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
