// Create file: components/home/features.tsx

"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Brain, FileText, Target, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTheme } from "next-themes"

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      className="glow-effect flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-border dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

const StepCircle = ({ number }: { number: string }) => {
  return (
    <motion.div 
      className="absolute -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-sm font-bold text-white"
      initial={{ scale: 0.8, opacity: 0.5 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.1, boxShadow: "0 0 12px rgba(62, 158, 255, 0.5)" }}
    >
      {number}
    </motion.div>
  );
};

export function Features() {
  const { theme } = useTheme()

  return (
    <div id="features" className="bg-gradient-to-b from-features-from to-features-to py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.div 
            className="inline-flex items-center justify-center rounded-full bg-background p-3 mb-6 shadow-lg dark:shadow-primary/5 sm:p-4"
            initial={{ rotate: -5, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ rotate: -5 }}
          >
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 sm:h-7 sm:w-7">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <svg 
                  className="relative h-full w-full text-primary" 
                  fill="none" 
                  height="24" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  width="24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 8V4H8"/>
                  <rect height="12" rx="2" width="16" x="4" y="8"/>
                  <path d="M2 14h2"/>
                  <path d="M20 14h2"/>
                  <path d="M15 13v2"/>
                  <path d="M9 13v2"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-foreground sm:text-sm">Powered by AI</p>
            </div>
          </motion.div>
          
          <motion.h2
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className={theme === 'dark' ? 'text-gradient-dark' : 'text-gradient-light'}>
              Your Fitness Journey, Reimagined
            </span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our AI-powered platform combines everything you need to achieve your fitness goals in one place.
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Brain size={24} />}
            title="AI Workout Planning"
            description="Personalized workout plans that adapt to your progress, preferences, and available equipment."
            delay={0}
          />
          <FeatureCard
            icon={<Target size={24} />}
            title="Goal Setting & Tracking"
            description="Set customized fitness goals and track your progress with detailed metrics and visualizations."
            delay={1}
          />
          <FeatureCard
            icon={<Activity size={24} />}
            title="Real-time Feedback"
            description="Get immediate feedback on your form and technique to maximize results and prevent injuries."
            delay={2}
          />
          <FeatureCard
            icon={<FileText size={24} />}
            title="Nutrition Planning"
            description="AI-generated meal plans tailored to your dietary needs, preferences, and fitness goals."
            delay={3}
          />
          <FeatureCard
            icon={<BarChart3 size={24} />}
            title="Progress Analytics"
            description="Comprehensive analytics and insights to understand your fitness journey and optimize your routine."
            delay={4}
          />
          <FeatureCard
            icon={<Zap size={24} />}
            title="Adaptive Training"
            description="Your workout program evolves as you progress, ensuring continuous improvement and challenge."
            delay={5}
          />
        </div>
      </div>

      <div className="mt-24 overflow-hidden bg-primary/5 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className={theme === 'dark' ? 'text-gradient-dark' : 'text-gradient-light'}>
                    How It Works
                  </span>
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  Get started in minutes and transform your fitness journey with our easy-to-use platform.
                </p>

                <div className="space-y-8">
                  {[
                    {
                      step: 1,
                      title: "Create Your Profile",
                      description: "Answer a few questions about your fitness level, goals, and preferences.",
                    },
                    {
                      step: 2,
                      title: "Get Your Custom Plan",
                      description: "Receive an AI-generated workout and nutrition plan tailored to your needs.",
                    },
                    {
                      step: 3,
                      title: "Track & Improve",
                      description: "Log your workouts, monitor progress, and watch as the AI adapts your plan.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="relative">
                        <motion.div
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-sm font-bold">{item.step}</span>
                        </motion.div>
                        {index < 2 && (
                          <div className="absolute left-1/2 top-10 h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-transparent" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative mx-auto aspect-square max-w-md rounded-2xl border bg-card p-6 shadow-xl dark:shadow-primary/5"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute left-0 right-0 top-0 flex justify-center">
                  <div className="h-1.5 w-32 rounded-full bg-primary/10">
                    <div className="h-full w-1/2 rounded-full bg-primary" />
                  </div>
                </div>
                
                <div className="mt-6 space-y-6">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
                      whileHover={{ y: -3, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                        <span className="font-medium text-primary">Step {item}</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2.5 w-24 rounded-full bg-muted" />
                        <div className="mt-2 h-2 w-32 rounded-full bg-muted" />
                      </div>
                      <div className="h-5 w-5 rounded-full bg-muted"></div>
                    </motion.div>
                  ))}

                  <motion.div
                    className="mt-6 rounded-lg bg-primary p-4 text-center font-medium text-primary-foreground"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    Get Started Now
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}