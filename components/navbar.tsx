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
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-500 ${
      scrolled 
        ? 'border-[#3E9EFF]/20 bg-[#121212]/90 backdrop-blur-lg supports-[backdrop-filter]:bg-[#121212]/80' 
        : 'border-transparent bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#3E9EFF] to-[#3E9EFF]/70">
                <span className="font-bold text-white">T</span>
                <div className="absolute inset-0 bg-[#3E9EFF]/20 blur-sm"></div>
              </div>
              <span className="logo-text inline-block text-xl font-bold tracking-tight transition-colors duration-300 hover:text-[#3E9EFF]">
                trAIner
              </span>
            </Link>
            
            <nav className="ml-10 hidden md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center text-sm font-medium transition-colors hover:text-[#3E9EFF]",
                    pathname === item.href
                      ? "text-[#3E9EFF]"
                      : "text-gray-300"
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
          
          <div className="flex items-center space-x-4">
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
                <div className="hidden sm:flex sm:items-center sm:space-x-3">
                  <Link href="/sign-in">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#3E9EFF]/30 bg-[#121212]/50 text-sm text-gray-200 transition-all hover:border-[#3E9EFF]/60 hover:bg-[#3E9EFF]/10 hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-sm text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3E9EFF]/20"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2 border-[#3E9EFF]/20 bg-[#121212]/50 text-gray-200 transition-all hover:border-[#3E9EFF]/40 hover:bg-[#3E9EFF]/10 hover:text-white md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l-[#3E9EFF]/20 bg-gray-900/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-6">
                  <nav className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center py-1.5 transition-colors",
                          pathname === item.href
                            ? "text-[#3E9EFF] font-medium"
                            : "text-gray-300 hover:text-[#3E9EFF]"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {!isSignedIn && (
                    <div className="flex flex-col space-y-3 pt-4">
                      <Link href="/sign-in" className="w-full">
                        <Button 
                          variant="outline" 
                          className="w-full border-[#3E9EFF]/30 bg-[#121212]/50 text-gray-200 transition-all hover:border-[#3E9EFF]/60 hover:bg-[#3E9EFF]/10 hover:text-white"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" className="w-full">
                        <Button 
                          className="w-full bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3E9EFF]/20"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
})

export { Navbar }