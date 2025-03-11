// Create file: components/workouts/workout-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WorkoutCardProps {
  day: string
  type: string
  exercises: number
  duration: number
  intensity: string
  isRestDay?: boolean
}

export function WorkoutCard({
  day,
  type,
  exercises,
  duration,
  intensity,
  isRestDay = false,
}: WorkoutCardProps) {
  return (
    <Card className={isRestDay ? "bg-muted" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{day}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{type}</span>
          </div>
          {!isRestDay && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exercises:</span>
                <span className="font-medium">{exercises}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Intensity:</span>
                <span className="font-medium">{intensity}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}