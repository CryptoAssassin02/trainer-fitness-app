// Create file: components/dashboard/sidebar.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart, 
  Dumbbell, 
  LineChart, 
  Settings, 
  Salad, 
  User, 
  Home
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  
  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/workouts",
      icon: Dumbbell,
      title: "Workouts",
    },
    {
      href: "/progress",
      icon: LineChart,
      title: "Progress",
    },
    {
      href: "/nutrition",
      icon: Salad,
      title: "Nutrition",
    },
    {
      href: "/stats",
      icon: BarChart,
      title: "Stats",
    },
    {
      href: "/profile",
      icon: User,
      title: "Profile",
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === route.href && "font-medium"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}