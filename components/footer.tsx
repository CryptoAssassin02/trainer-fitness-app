// Create file: components/footer.tsx

import React from 'react'
import Link from "next/link"

const Footer = React.memo(function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2025 trAIner. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="text-sm font-medium underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium underline underline-offset-4"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
})

export { Footer }