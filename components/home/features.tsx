// Create file: components/home/features.tsx

import React from 'react'
import { Check, Dumbbell, Brain, LineChart, Salad } from 'lucide-react'

const Features = React.memo(function Features() {
  return (
    <section className="bg-muted/40 py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Everything you need to optimize your fitness journey, powered by AI.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Custom Workouts</h3>
            <p className="text-center text-muted-foreground">
              AI-generated workout plans tailored to your goals, preferences, and fitness level.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Salad className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Nutrition Tracking</h3>
            <p className="text-center text-muted-foreground">
              Automatically calculated macro goals based on your workout routine and body metrics.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Progress Tracking</h3>
            <p className="text-center text-muted-foreground">
              Log and visualize your fitness journey with intuitive charts and check-ins.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Adaptation</h3>
            <p className="text-center text-muted-foreground">
              Your plans evolve with you as you progress, ensuring optimal results over time.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center space-y-4">
          <h3 className="text-xl font-bold">All-In-One Solution</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
            ].map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
})

export { Features }