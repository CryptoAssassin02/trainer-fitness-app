// Create file: app/(dashboard)/dashboard/page.tsx

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { 
  ActivityIcon, 
  CalendarIcon, 
  PlusCircle, 
  TrendingUpIcon 
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts"
import { useActiveWorkoutPlan } from "@/hooks/use-workout-plans-db"
import { useProgressHistory, useProgressMetrics } from "@/hooks/use-progress-db"
import { useActiveMacros } from "@/hooks/use-nutrition-db"

// Types for our data
interface CheckIn {
  created_at: string
  weight: number
  unit_system: 'imperial' | 'metric'
}

interface Workout {
  name: string
  exercises: any[]
  completed: boolean
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex-1 space-y-4">
      <DashboardStats />
    </div>
  )
}

// Helper component for macro display
function MacroProgressItem({ 
  label, 
  value, 
  unit, 
  color 
}: { 
  label: string
  value: number
  unit: string
  color: string 
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-sm font-medium">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: '70%' }} />
      </div>
    </div>
  )
}

// Mini progress chart component
function ProgressMiniChart() {
  const { data: progressData = [] } = useProgressHistory()
  
  // Get last 5 check-ins
  const chartData = progressData
    .slice(0, 5)
    .map((checkIn: CheckIn) => ({
      date: new Date(checkIn.created_at).toLocaleDateString(),
      weight: checkIn.weight
    }))
    .reverse()
  
  if (chartData.length < 2) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Not enough data for a chart</p>
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#3E9EFF" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Empty state component
function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description: string
  action: React.ReactNode 
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
      <div className="rounded-full bg-muted p-3">
        <PlusCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

// Client component for the stats
"use client"

function DashboardStats() {
  const { data: activePlan, isPending: isLoadingPlan } = useActiveWorkoutPlan()
  const { data: progressData = [], isPending: isLoadingProgress } = useProgressHistory()
  const { data: macros, isPending: isLoadingMacros } = useActiveMacros()
  
  const latestCheckIn = progressData[0] // First item since data is ordered by created_at desc
  
  if (isLoadingPlan || isLoadingProgress || isLoadingMacros) {
    return <div>Loading dashboard data...</div>
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Workout Plan
          </CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activePlan ? activePlan.title : "None"}
          </div>
          <p className="text-xs text-muted-foreground">
            {activePlan 
              ? `Created on ${new Date(activePlan.created_at).toLocaleDateString()}`
              : "Generate a workout plan to get started"
            }
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Latest Check-in
          </CardTitle>
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestCheckIn 
              ? `${latestCheckIn.weight} ${latestCheckIn.unit_system === 'imperial' ? 'lbs' : 'kg'}`
              : "No check-ins yet"
            }
          </div>
          <p className="text-xs text-muted-foreground">
            {latestCheckIn
              ? `On ${new Date(latestCheckIn.created_at).toLocaleDateString()}`
              : "Record your first check-in"
            }
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Nutrition Goals
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {macros ? `${macros.calories} calories` : "Not set"}
          </div>
          <p className="text-xs text-muted-foreground">
            {macros
              ? `${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat`
              : "Set your nutrition goals"
            }
          </p>
        </CardContent>
      </Card>
      
      {/* Recent Workouts Summary */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Workouts</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/workouts">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activePlan ? (
            <div className="space-y-4">
              {activePlan.workouts?.slice(0, 3).map((workout: Workout, index: number) => (
                <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {workout.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {workout.exercises?.length || 0} exercises
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workout.completed ? "default" : "outline"}>
                      {workout.completed ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No workout plan"
              description="You haven't created a workout plan yet."
              action={
                <Button size="sm" asChild>
                  <Link href="/workouts/generate">Create Workout Plan</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
      
      {/* Progress Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {latestCheckIn ? (
            <div className="h-[200px]">
              <ProgressMiniChart />
            </div>
          ) : (
            <EmptyState
              title="No progress data"
              description="You haven't recorded any check-ins yet."
              action={
                <Button size="sm" asChild>
                  <Link href="/progress/check-in">Record Check-in</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
      
      {/* Nutrition Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          {macros ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calories</span>
                  <span className="font-medium">{macros.calories}</span>
                </div>
                <Progress value={65} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MacroProgressItem 
                  label="Protein" 
                  value={macros.protein} 
                  unit="g" 
                  color="bg-blue-500" 
                />
                <MacroProgressItem 
                  label="Carbs" 
                  value={macros.carbs} 
                  unit="g" 
                  color="bg-green-500" 
                />
                <MacroProgressItem 
                  label="Fat" 
                  value={macros.fat} 
                  unit="g" 
                  color="bg-yellow-500" 
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title="No nutrition goals"
              description="You haven't set your nutrition goals yet."
              action={
                <Button size="sm" asChild>
                  <Link href="/nutrition">Set Goals</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}