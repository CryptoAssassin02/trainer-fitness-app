// Create file: app/(dashboard)/layout.tsx

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <Sidebar className="hidden md:block" />
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}