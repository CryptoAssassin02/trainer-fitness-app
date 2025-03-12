// Create file: components/mode-toggle.tsx

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full border hover:bg-accent/10 transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-px w-full origin-center scale-x-0 rounded-full bg-primary transition-all duration-300 group-hover:scale-x-100"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in zoom-in-50 duration-200">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`flex cursor-pointer items-center gap-2 font-medium transition-colors ${theme === 'light' ? 'text-primary' : ''}`}
        >
          <Sun className="h-[1rem] w-[1rem]" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`flex cursor-pointer items-center gap-2 font-medium transition-colors ${theme === 'dark' ? 'text-primary' : ''}`}
        >
          <Moon className="h-[1rem] w-[1rem]" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`flex cursor-pointer items-center gap-2 font-medium transition-colors ${theme === 'system' ? 'text-primary' : ''}`}
        >
          <svg className="h-[1rem] w-[1rem]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}