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
  
  // Check if user has admin role - this is a simplified check
  // In a real app, you would check against a specific role or permission
  const isAdmin = React.useMemo(() => {
    if (!user) return false
    // This is a placeholder - replace with your actual admin check logic
    return user.publicMetadata?.role === 'admin' || user.primaryEmailAddress?.emailAddress?.includes('admin');
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex gap-2 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="logo-text text-xl font-bold">trAIner</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {isSignedIn && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Admin Dropdown Menu */}
            {isSignedIn && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Admin
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/deployment-checklist">
                      Deployment Checklist
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden items-center space-x-2 md:flex">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
            <ModeToggle />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>trAIner</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 pt-4">
                {isSignedIn && navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Admin Link in Mobile Menu */}
                {isSignedIn && isAdmin && (
                  <div className="space-y-3 pt-2">
                    <div className="text-sm font-medium">Admin</div>
                    <Link 
                      href="/admin/deployment-checklist"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Deployment Checklist
                    </Link>
                  </div>
                )}
                
                {!isSignedIn ? (
                  <>
                    <Link href="/sign-in">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm font-medium">Your Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <ModeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
})

export { Navbar }