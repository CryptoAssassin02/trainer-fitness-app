// Create file: components/home/hero.tsx

"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function Hero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement for the background effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-gradient-to-b from-hero-from to-hero-to pt-16 pb-14 md:pt-18 md:pb-16"
      onMouseMove={handleMouseMove}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="grid-background h-full w-full bg-[linear-gradient(to_right,hsl(var(--accent)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--accent)/0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      {/* Interactive Glow Effect (follows mouse) */}
      <div 
        className="pointer-events-none absolute z-0 h-56 w-56 rounded-full bg-primary/20 opacity-70 blur-3xl transition-transform duration-300"
        style={{ 
          left: `${mousePosition.x - 112}px`, 
          top: `${mousePosition.y - 112}px`,
          opacity: mousePosition.x === 0 ? 0 : 0.7
        }}
      />

      {/* Floating Circles */}
      <motion.div 
        className="absolute right-[5%] top-[10%] h-8 w-8 rounded-full bg-primary/40 blur-sm dark:bg-primary/20"
        animate={{ y: [0, 15, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute left-[5%] top-[50%] h-6 w-6 rounded-full bg-primary/40 blur-sm dark:bg-primary/20"
        animate={{ y: [0, -20, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center w-full">
          {/* Text Content */}
          <div className="w-full text-center mb-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="mb-2 text-5xl md:text-6xl lg:text-7xl font-bold logo-text">
                tr<span className="highlight">AI</span>ner
              </h1>
              <h2 className="mb-3 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className={theme === 'dark' ? 'text-gradient-dark' : 'text-gradient-light'}>
                  Your Personal AI-Powered Fitness Coach
                </span>
              </h2>
              <p className="mx-auto mb-4 text-lg text-muted-foreground md:text-xl max-w-2xl">
                Customized workouts, real-time tracking, and AI-driven insights to help you achieve your fitness goals faster.
              </p>
            </motion.div>
          </div>
          
          {/* Logo Image instead of Hero image */}
          <motion.div 
            className="relative w-full max-w-3xl mb-6 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Glowing background effect for the logo */}
              <div className="absolute inset-0 -m-10 rounded-full bg-primary/10 blur-3xl opacity-60"></div>
              
              {/* Pulsing effect */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/5" 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              
              <Image
                src="/new-app-logo.png"
                alt="trAIner Logo"
                fill
                priority
                className="object-contain z-10 p-4"
              />
              
              {/* Additional hover effects */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent opacity-0"
                whileHover={{ opacity: 0.6, rotate: 15 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </motion.div>
          
          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button className="w-full bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="w-full border-border bg-background px-8 py-6 text-lg font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}