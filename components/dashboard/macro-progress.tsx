// Create file: components/dashboard/macro-progress.tsx

"use client"

import { Progress } from "@/components/ui/progress"
import { useNutrition } from "@/hooks/use-nutrition"

export function MacroProgress() {
  const { activeMacros: macros, isLoading } = useNutrition()
  
  if (isLoading) {
    return <div>Loading macro progress...</div>
  }
  
  if (!macros) {
    return (
      <div className="text-sm text-muted-foreground">
        No macro goals set. Use the macro calculator to get started.
      </div>
    )
  }
  
  // Example of current progress (in a real app, this would come from a daily food log)
  const currentProgress = {
    calories: Math.round(macros.calories * 0.84),
    protein: Math.round(macros.protein * 0.9),
    carbs: Math.round(macros.carbs * 0.87),
    fat: Math.round(macros.fat * 0.75)
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">Protein</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentProgress.protein}g / {macros.protein}g
          </span>
        </div>
        <Progress value={(currentProgress.protein / macros.protein) * 100} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-sm font-medium">Carbs</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentProgress.carbs}g / {macros.carbs}g
          </span>
        </div>
        <Progress value={(currentProgress.carbs / macros.carbs) * 100} className="h-2 [&>div]:bg-[#f59e0b]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
            <span className="text-sm font-medium">Fat</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentProgress.fat}g / {macros.fat}g
          </span>
        </div>
        <Progress value={(currentProgress.fat / macros.fat) * 100} className="h-2 [&>div]:bg-[#10b981]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#6366f1]"></div>
            <span className="text-sm font-medium">Calories</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentProgress.calories} / {macros.calories}
          </span>
        </div>
        <Progress value={(currentProgress.calories / macros.calories) * 100} className="h-2 [&>div]:bg-[#6366f1]" />
      </div>
    </div>
  )
}