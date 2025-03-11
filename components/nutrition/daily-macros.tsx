// Create file: components/nutrition/daily-macros.tsx

"use client"

import { useNutrition } from "@/hooks/use-nutrition"
import { Progress } from "@/components/ui/progress"

export function DailyMacros() {
  const { activeMacros: macros, isLoading } = useNutrition()
  
  if (isLoading) {
    return <div>Loading macro goals...</div>
  }
  
  if (!macros) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p>No macro goals set yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use the macro calculator to set your nutritional targets.
        </p>
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
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Calories</span>
          <span className="text-sm text-muted-foreground">
            {currentProgress.calories} / {macros.calories}
          </span>
        </div>
        <Progress value={(currentProgress.calories / macros.calories) * 100} className="h-2" />
        <div className="flex text-xs text-muted-foreground">
          <div className="flex-1">0</div>
          <div className="flex-1 text-center">{Math.round(macros.calories / 2)}</div>
          <div className="flex-1 text-right">{macros.calories}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Protein</span>
          <span className="text-sm text-muted-foreground">
            {currentProgress.protein}g / {macros.protein}g
          </span>
        </div>
        <Progress value={(currentProgress.protein / macros.protein) * 100} className="h-2" />
        <div className="flex text-xs text-muted-foreground">
          <div className="flex-1">0g</div>
          <div className="flex-1 text-center">{Math.round(macros.protein / 2)}g</div>
          <div className="flex-1 text-right">{macros.protein}g</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Carbohydrates</span>
          <span className="text-sm text-muted-foreground">
            {currentProgress.carbs}g / {macros.carbs}g
          </span>
        </div>
        <Progress value={(currentProgress.carbs / macros.carbs) * 100} className="h-2" />
        <div className="flex text-xs text-muted-foreground">
          <div className="flex-1">0g</div>
          <div className="flex-1 text-center">{Math.round(macros.carbs / 2)}g</div>
          <div className="flex-1 text-right">{macros.carbs}g</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Fat</span>
          <span className="text-sm text-muted-foreground">
            {currentProgress.fat}g / {macros.fat}g
          </span>
        </div>
        <Progress value={(currentProgress.fat / macros.fat) * 100} className="h-2" />
        <div className="flex text-xs text-muted-foreground">
          <div className="flex-1">0g</div>
          <div className="flex-1 text-center">{Math.round(macros.fat / 2)}g</div>
          <div className="flex-1 text-right">{macros.fat}g</div>
        </div>
      </div>
    </div>
  )
}