"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProgress } from "@/hooks/use-progress"
import { type ProgressCheckin } from "@/types/progress"
import { cn } from "@/lib/utils"

type MetricType = "weight" | "body_fat" | "measurements"
type MeasurementType = "chest" | "waist" | "hips" | "biceps" | "thighs"

interface ChartDataPoint {
  date: string
  value: number
}

interface ProgressHistoryProps {
  className?: string
}

const calculateTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable'
  
  // Calculate linear regression slope
  const n = values.length
  const indices = Array.from({ length: n }, (_, i) => i)
  
  const sumX = indices.reduce((a, b) => a + b, 0)
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0)
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  
  if (Math.abs(slope) < 0.01) return 'stable'
  return slope > 0 ? 'increasing' : 'decreasing'
}

export function ProgressHistory({ className }: ProgressHistoryProps) {
  const { progressCheckins } = useProgress()
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("weight")
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementType>("chest")

  const chartData: ChartDataPoint[] = (progressCheckins ?? [])
    .map((entry: ProgressCheckin) => {
      let value: number | undefined

      if (selectedMetric === "measurements" && entry.measurements) {
        value = entry.measurements[selectedMeasurement]
      } else if (selectedMetric === "weight") {
        value = entry.weight
      } else if (selectedMetric === "body_fat") {
        value = entry.body_fat ?? undefined
      }

      return value !== undefined && value !== null
        ? {
            date: format(new Date(entry.check_in_date), "MMM d"),
            value,
          }
        : null
    })
    .filter((data): data is ChartDataPoint => data !== null)

  const getYAxisLabel = () => {
    switch (selectedMetric) {
      case "weight":
        return "Weight (kg/lbs)"
      case "body_fat":
        return "Body Fat %"
      case "measurements":
        return `${selectedMeasurement.charAt(0).toUpperCase() + selectedMeasurement.slice(1)} (cm/in)`
      default:
        return ""
    }
  }

  const stats = chartData.length > 0
    ? {
        current: chartData[0].value,
        change: chartData[0].value - chartData[chartData.length - 1].value,
        trend: calculateTrend(chartData.map(d => d.value)),
        average: chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length,
      }
    : null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Progress History</CardTitle>
        <CardDescription>Track your progress over time</CardDescription>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <Select
              value={selectedMetric}
              onValueChange={(value: MetricType) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="body_fat">Body Fat</SelectItem>
                <SelectItem value="measurements">Measurements</SelectItem>
              </SelectContent>
            </Select>

            {selectedMetric === "measurements" && (
              <Select
                value={selectedMeasurement}
                onValueChange={(value: MeasurementType) => setSelectedMeasurement(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select measurement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="waist">Waist</SelectItem>
                  <SelectItem value="hips">Hips</SelectItem>
                  <SelectItem value="biceps">Biceps</SelectItem>
                  <SelectItem value="thighs">Thighs</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-sm font-medium">Current</div>
                <div className="mt-1 text-2xl font-bold">{stats.current.toFixed(1)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-sm font-medium">Change</div>
                <div className={cn(
                  "mt-1 text-2xl font-bold",
                  stats.change > 0 ? "text-green-600" : stats.change < 0 ? "text-red-600" : ""
                )}>
                  {stats.change > 0 ? "+" : ""}{stats.change.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-sm font-medium">Average</div>
                <div className="mt-1 text-2xl font-bold">{stats.average.toFixed(1)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-sm font-medium">Trend</div>
                <div className="mt-1 text-2xl font-bold capitalize">{stats.trend}</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{
                    value: getYAxisLabel(),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">
              No data available for the selected metric
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 