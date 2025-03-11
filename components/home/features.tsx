// Create file: components/home/features.tsx

"use client"

import React from 'react'
import { Check, Dumbbell, Brain, LineChart, Salad, ArrowRight, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <motion.div 
      className="group relative flex flex-col items-center space-y-4 rounded-xl border border-[#3E9EFF]/10 bg-black/5 p-6 transition-all duration-300 hover:border-[#3E9EFF]/40 hover:shadow-lg hover:shadow-[#3E9EFF]/5"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-transparent to-[#3E9EFF]/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"></div>
      
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3E9EFF]/20 to-[#3E9EFF]/10 p-3 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#3E9EFF]/30 group-hover:to-[#3E9EFF]/20">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut"
          }}
        >
          <Icon className="h-8 w-8 text-[#3E9EFF] transition-transform duration-300 group-hover:scale-110" />
        </motion.div>
        <div className="absolute inset-0 -z-10 rounded-full bg-[#3E9EFF]/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>
      
      <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-[#3E9EFF]">{title}</h3>
      
      <p className="text-center text-gray-300 transition-colors duration-300 group-hover:text-white">
        {description}
      </p>
    </motion.div>
  )
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

const Features = React.memo(function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 }
    }
  };

  const features = [
    {
      icon: Dumbbell,
      title: "Custom Workouts",
      description: "AI-generated workout plans tailored to your goals, preferences, and fitness level."
    },
    {
      icon: Salad,
      title: "Nutrition Tracking",
      description: "Automatically calculated macro goals based on your workout routine and body metrics."
    },
    {
      icon: LineChart,
      title: "Progress Tracking",
      description: "Log and visualize your fitness journey with intuitive charts and check-ins."
    },
    {
      icon: Brain,
      title: "Smart Adaptation",
      description: "Your plans evolve with you as you progress, ensuring optimal results over time."
    }
  ];

  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-[#121212] py-24 sm:py-32">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-[#3E9EFF]/5 blur-3xl"></div>
        <div className="absolute top-1/3 right-0 h-96 w-96 -rotate-12 bg-gradient-to-r from-[#3E9EFF]/0 to-[#3E9EFF]/5 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-20 flex flex-col items-center space-y-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex items-center rounded-full bg-[#3E9EFF]/10 px-4 py-2 text-sm font-medium text-[#3E9EFF]"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Powered by AI
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-white via-[#3E9EFF] to-white bg-clip-text text-transparent">
              Your Fitness Journey, Reimagined
            </span>
          </h2>
          <p className="max-w-[700px] text-gray-200 md:text-xl">
            Everything you need to optimize your fitness journey, powered by artificial intelligence.
          </p>
        </motion.div>

        {/* How it works section */}
        <motion.div 
          className="mb-28 flex flex-col items-center space-y-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#3E9EFF] to-white bg-clip-text text-transparent">
              How It Works
            </span>
          </h3>

          <div className="relative grid w-full max-w-5xl grid-cols-1 gap-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line for desktop */}
            <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 transform bg-gradient-to-r from-[#3E9EFF]/5 via-[#3E9EFF]/20 to-[#3E9EFF]/5 lg:block"></div>
            
            {/* Process steps */}
            {[
              { number: "01", title: "Create Profile", description: "Input your fitness level, goals, and preferences" },
              { number: "02", title: "AI Analysis", description: "Our AI builds your personalized fitness plan" },
              { number: "03", title: "Start Training", description: "Follow your customized workout routines" },
              { number: "04", title: "Track Progress", description: "Monitor your improvements and adapt your plan" }
            ].map((step, index) => (
              <motion.div 
                key={step.number}
                className="relative flex flex-col items-center rounded-lg border border-[#3E9EFF]/20 bg-black/20 p-6 text-center shadow-sm transition-all duration-300 hover:border-[#3E9EFF]/40 hover:shadow-md hover:shadow-[#3E9EFF]/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StepCircle number={step.number} />
                <h4 className="mt-4 mb-3 text-lg font-bold text-white">{step.title}</h4>
                <p className="text-sm text-gray-300">{step.description}</p>
                {index < 3 && (
                  <motion.div 
                    className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-[#3E9EFF] lg:block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut" 
                    }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <motion.div 
          className="mt-28 flex flex-col items-center space-y-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white">All-In-One Fitness Solution</h3>
          
          <ul className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {[
              'AI-driven workout creation',
              'Bi-weekly progress check-ins',
              'Macro calculation',
              'Natural language plan editing',
              'Export to multiple formats',
              'Customizable notifications',
              'Secure data storage',
              'Multiple measurement units',
              'Detailed technique notes',
            ].map((feature, i) => (
              <motion.li 
                key={feature} 
                className="flex items-center space-x-3 rounded-lg border border-[#3E9EFF]/20 bg-black/20 px-4 py-3.5 shadow-sm transition-all duration-300 hover:border-[#3E9EFF]/50 hover:bg-[#3E9EFF]/10 hover:shadow-md hover:shadow-[#3E9EFF]/5"
                whileHover={{ x: 5, scale: 1.02, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                >
                  <Zap className="h-5 w-5 flex-shrink-0 text-[#3E9EFF]" />
                </motion.div>
                <span className="text-sm font-medium text-white">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Link href="/sign-up">
            <Button size="lg" className="mt-5 bg-gradient-to-r from-[#3E9EFF] to-[#3E9EFF]/80 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3E9EFF]/20">
              Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
})

export { Features }