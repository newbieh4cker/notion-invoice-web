export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 py-6 md:h-16 md:flex-row md:py-0 px-4">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} 노션 연동 온라인 견적서. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
