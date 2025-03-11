"use client"

import { useState } from "react"
import { Metadata } from "next"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useMacros } from "@/hooks/use-macros"

export const metadata: Metadata = {
  title: "Macro Tracking",
  description: "Track your daily macro nutrients",
}

export default function MacrosPage() {
  const [date, setDate] = useState<Date>(new Date())
  const { macros, isLoading } = useMacros(date)

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Macro Tracking</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(
              "w-[200px] justify-start text-left font-normal",
            )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calories
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {macros?.current.calories} / {macros?.target.calories}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateProgress(macros?.current.calories ?? 0, macros?.target.calories ?? 1)}% of daily goal
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${calculateProgress(macros?.current.calories ?? 0, macros?.target.calories ?? 1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Protein
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
              <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {macros?.current.protein}g / {macros?.target.protein}g
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateProgress(macros?.current.protein ?? 0, macros?.target.protein ?? 1)}% of daily goal
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${calculateProgress(macros?.current.protein ?? 0, macros?.target.protein ?? 1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carbs
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {macros?.current.carbs}g / {macros?.target.carbs}g
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateProgress(macros?.current.carbs ?? 0, macros?.target.carbs ?? 1)}% of daily goal
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${calculateProgress(macros?.current.carbs ?? 0, macros?.target.carbs ?? 1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fat
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {macros?.current.fat}g / {macros?.target.fat}g
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateProgress(macros?.current.fat ?? 0, macros?.target.fat ?? 1)}% of daily goal
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-yellow-500"
                style={{
                  width: `${calculateProgress(macros?.current.fat ?? 0, macros?.target.fat ?? 1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal Log</CardTitle>
          <CardDescription>
            Track your meals and macros throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Add meal logging component */}
          <div className="text-center text-sm text-muted-foreground">
            Meal logging coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 