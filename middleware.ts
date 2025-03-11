// Update file: middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
