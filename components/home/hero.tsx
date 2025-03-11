// Create file: components/home/hero.tsx

"use client"

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const Hero = React.memo(function Hero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(() => ['Smart', 'Personalized', 'Adaptive', 'Powerful'], [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0)
      } else {
        setTitleNumber(titleNumber + 1)
      }
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              <span className="relative flex h-[70px] w-full justify-center overflow-hidden text-center">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary"
                    initial={{ opacity: 0, y: '-100%' }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <br />
              AI-Powered Fitness
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Create personalized workout plans and nutrition goals tailored to your body and fitness level with the help of AI.
            </p>
          </div>
          <div className="relative mx-auto mt-8 w-full max-w-4xl">
            <Image 
              src="/hero-workout.jpg" 
              alt="AI-powered workout planning" 
              width={1200}
              height={675}
              priority={true}
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

export { Hero }