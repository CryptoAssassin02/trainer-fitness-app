// Create file: components/progress/progress-table.tsx

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProgress } from "@/hooks/use-progress"

export function ProgressTable() {
  const { progressCheckins, isLoading, deleteProgressCheckin } = useProgress()
  
  if (isLoading) {
    return <div>Loading progress history...</div>
  }
  
  if (!progressCheckins || progressCheckins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p>No progress history available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Submit a check-in to start tracking your progress.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Body Fat</TableHead>
              <TableHead>Chest</TableHead>
              <TableHead>Waist</TableHead>
              <TableHead>Arms</TableHead>
              <TableHead>Legs</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressCheckins.map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {new Date(entry.created_at).toLocaleDateString()}
                  {index === 0 && <Badge className="ml-2">Latest</Badge>}
                </TableCell>
                <TableCell>{entry.weight} {entry.unit_system === 'imperial' ? 'lbs' : 'kg'}</TableCell>
                <TableCell>{entry.body_fat ? `${entry.body_fat}%` : '-'}</TableCell>
                <TableCell>{entry.chest ? `${entry.chest} in` : '-'}</TableCell>
                <TableCell>{entry.waist ? `${entry.waist} in` : '-'}</TableCell>
                <TableCell>{entry.arms ? `${entry.arms} in` : '-'}</TableCell>
                <TableCell>{entry.legs ? `${entry.legs} in` : '-'}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteProgressCheckin(entry.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}