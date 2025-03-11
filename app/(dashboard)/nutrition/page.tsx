"use client"

import { useNutrition } from "@/hooks/use-nutrition"
import { DailyMacros } from "@/components/nutrition/daily-macros"
import { MacroCalculator } from "@/components/nutrition/macro-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NutritionPage() {
  const { activeMacros: macros } = useNutrition()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Nutrition</h1>
      
      <Tabs defaultValue={macros ? "track" : "calculate"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="track">Track Macros</TabsTrigger>
          <TabsTrigger value="calculate">Calculate Macros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <Card>
            <CardHeader>
              <CardTitle>Daily Macro Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyMacros />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calculate">
          <Card>
            <CardHeader>
              <CardTitle>Macro Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <MacroCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}