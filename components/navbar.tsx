// Create file: components/navbar.tsx

"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserButton, useUser } from "@clerk/nextjs"
import { ChevronDown, Menu, Shield } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Workouts", href: "/workouts" },
  { name: "Progress", href: "/progress" },
  { name: "Nutrition", href: "/nutrition" },
  { name: "Profile", href: "/profile" },
]

const Navbar = React.memo(function Navbar() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()
  const [scrolled, setScrolled] = React.useState(false)
  
  // Check if user has admin role - this is a simplified check
  // In a real app, you would check against a specific role or permission
  const isAdmin = React.useMemo(() => {
    if (!user) return false
    // This is a placeholder - replace with your actual admin check logic
    return user.publicMetadata?.role === 'admin' || user.primaryEmailAddress?.emailAddress?.includes('admin');
  }, [user]);

  // Add scroll event listener
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled 
        ? 'border-[#3E9EFF]/10 bg-[#121212]/80 backdrop-blur-lg supports-[backdrop-filter]:bg-[#121212]/80' 
        : 'border-transparent bg-transparent'
    }`}>
      <div className="container flex h-16 items-center">
        <div className="flex gap-2 md:gap-10">
          <Link
            href="/"
            className="flex items-center space-x-2"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#3E9EFF] to-[#3E9EFF]/70">
              <span className="font-bold text-white">T</span>
              <div className="absolute inset-0 bg-[#3E9EFF]/20 blur-sm"></div>
            </div>
            <span className="logo-text inline-block font-bold text-xl transition-colors duration-300 hover:text-[#3E9EFF]">
              trAIner
            </span>
          </Link>
          
          <nav className="hidden md:flex md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center transition-colors hover:text-[#3E9EFF]",
                  pathname === item.href
                    ? "text-[#3E9EFF] font-medium"
                    : "text-foreground/60"
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-[21px] left-0 h-[2px] w-full bg-gradient-to-r from-[#3E9EFF]/50 via-[#3E9EFF] to-[#3E9EFF]/50"></span>
                )}
                <span className="absolute -bottom-[21px] left-0 h-[2px] w-0 bg-gradient-to-r from-[#3E9EFF]/50 via-[#3E9EFF] to-[#3E9EFF]/50 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          {isSignedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full border border-[#3E9EFF]/20 bg-[#3E9EFF]/5 transition-all hover:border-[#3E9EFF]/40 hover:bg-[#3E9EFF]/10 hover:text-[#3E9EFF]"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="sr-only">Admin</span>
                  </Button>
                </Link>
              )}
              <ModeToggle />
              <div className="relative overflow-hidden rounded-full">
                <div className="absolute inset-0 animate-pulse bg-[#3E9EFF]/10 blur-md"></div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <>
              <ModeToggle />
              <Link href="/sign-in">
                <Button 
                  variant="outline" 
                  className="border-[#3E9EFF]/30 hover:border-[#3E9EFF]/60 hover:bg-[#3E9EFF]/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button 
                  className="bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3E9EFF]/20"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center py-1.5 transition-colors",
                      pathname === item.href
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
})

export { Navbar }