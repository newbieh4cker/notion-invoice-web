import Link from "next/link"
import { FileText } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              견적서 관리
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              대시보드
            </Link>
            <Link
              href="/invoices"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              견적서
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
