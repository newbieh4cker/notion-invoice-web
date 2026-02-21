/**
 * 404 페이지 - 존재하지 않는 경로 접근 시 표시
 * 서버 컴포넌트로 구현 (App Router 기본값)
 */

import Link from "next/link"
import { FileQuestion, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            404 - 페이지를 찾을 수 없습니다
          </CardTitle>
          <CardDescription className="text-base">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            URL이 올바른지 확인하거나, 아래 버튼을 통해 이동해주세요.
          </p>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          <Button asChild variant="default">
            <Link href="/" className="gap-2 inline-flex items-center">
              <Home className="h-4 w-4" />
              홈으로 이동
            </Link>
          </Button>
          <BackButton />
        </CardFooter>
      </Card>
    </div>
  )
}
