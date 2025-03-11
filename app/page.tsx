// Update file: app/page.tsx

import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}