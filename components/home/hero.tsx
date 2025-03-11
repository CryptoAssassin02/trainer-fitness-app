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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#121212] to-gray-900 py-24 sm:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#3E9EFF]/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#3E9EFF]/10 blur-2xl"></div>
        <div className="absolute top-1/3 left-1/4 h-32 w-32 rounded-full bg-[#3E9EFF]/10 blur-xl"></div>
        <div className="absolute grid h-full w-full grid-cols-6 opacity-[0.015]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="col-span-1 h-full border-r border-[#3E9EFF]/20"></div>
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="col-span-6 w-full border-b border-[#3E9EFF]/20"></div>
          ))}
        </div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-8 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="relative flex h-[70px] w-full justify-center overflow-hidden text-center">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#3E9EFF]"
                    initial={{ opacity: 0, y: '-100%' }}
                    transition={{ type: 'spring', stiffness: 50, damping: 10 }}
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
              <span className="bg-gradient-to-r from-white via-[#3E9EFF]/90 to-white bg-clip-text text-transparent">
                AI-Powered Fitness
              </span>
            </h1>
            <motion.p 
              className="mx-auto max-w-2xl text-gray-300 md:text-xl"
              variants={itemVariants}
            >
              Create personalized workout plans and nutrition goals tailored to your body and fitness level with the help of AI.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="relative mx-auto mt-8 w-full max-w-4xl"
            variants={itemVariants}
          >
            <div className="aspect-[16/9] overflow-hidden rounded-xl border border-[#3E9EFF]/20 bg-black/20 shadow-2xl shadow-[#3E9EFF]/10">
              <Image 
                src="/hero-workout.jpg" 
                alt="AI-powered workout planning" 
                width={1200}
                height={675}
                priority={true}
                className="rounded-lg object-cover transition-all duration-500 hover:scale-105"
              />
              {/* Overlay glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent"></div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-3 sm:flex-row"
            variants={itemVariants}
          >
            <Link href="/sign-up">
              <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3E9EFF]/20">
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
                <span className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-[#3E9EFF]/90 to-[#3E9EFF] transition-transform duration-300 hover:translate-y-0"></span>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-[#3E9EFF]/30 text-gray-200 transition-all hover:border-[#3E9EFF]/80 hover:bg-[#3E9EFF]/10 hover:text-white">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
})

export { Hero }