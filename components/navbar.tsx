// Create file: components/navbar.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { isSignedIn } = useUser();

  return (
    <div className={cn(
      "fixed top-0 w-full z-50 flex justify-center",
      "bg-background/80 backdrop-blur-md border-b",
      className
    )}>
      <div className="flex items-center w-full max-w-7xl justify-between py-1 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 transition-all hover:opacity-90">
          <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-visible">
            <Image 
              src="/new-app-logo.png" 
              alt="trAIner Logo" 
              fill 
              className="object-contain scale-[2.2]"
              priority
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold logo-text">
            tr<span className="highlight">AI</span>ner
          </h1>
        </Link>
        <div className="flex gap-x-2 md:gap-x-4 items-center">
          <ModeToggle />
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex border hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  className="border hover:bg-accent/10 transition-all"
                >
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}