// Create file: components/progress/progress-chart.tsx

"use client"

import { useState } from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProgress } from "@/hooks/use-progress"

const metrics = [
  { id: "weight", name: "Weight", color: "#3B82F6", unit: "lbs" },
  { id: "bodyFat", name: "Body Fat", color: "#EF4444", unit: "%" },
  { id: "chest", name: "Chest", color: "#10B981", unit: "in" },
  { id: "waist", name: "Waist", color: "#F59E0B", unit: "in" },
  { id: "arms", name: "Arms", color: "#8B5CF6", unit: "in" },
  { id: "legs", name: "Legs", color: "#EC4899", unit: "in" }
]

export function ProgressChart() {
  const [selectedMetric, setSelectedMetric] = useState("weight")
  const { progressCheckins, isLoading } = useProgress()
  
  const metric = metrics.find(m => m.id === selectedMetric)
  
  if (isLoading) {
    return <div>Loading progress data...</div>
  }
  
  if (!progressCheckins || progressCheckins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p>No progress data available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Submit a check-in to start tracking your progress.
        </p>
      </div>
    )
  }

  // Transform progress data for the chart
  const chartData = progressCheckins.map(checkin => ({
    date: new Date(checkin.created_at).toLocaleDateString(),
    weight: checkin.weight,
    bodyFat: checkin.body_fat,
    chest: checkin.chest,
    waist: checkin.waist,
    arms: checkin.arms,
    legs: checkin.legs,
  })).reverse() // Show oldest to newest
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metrics.map(metric => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {metric && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: metric.color }} />
            <span>Measured in {metric.unit}</span>
          </div>
        )}
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={metric?.color}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}