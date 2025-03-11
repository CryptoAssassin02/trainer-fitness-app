// Create file: components/settings/export-import-settings.tsx

"use client"

import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { useProgress } from "@/hooks/use-progress"
import { useNutrition } from "@/hooks/use-nutrition"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

const exportFormSchema = z.object({
  format: z.enum(["xlsx", "csv", "json", "pdf"]),
  type: z.enum(["workouts", "progress", "nutrition", "all"]),
})

type ExportFormValues = z.infer<typeof exportFormSchema>

export function ExportImportSettings() {
  const { workoutPlans, isLoading: isLoadingWorkouts } = useWorkoutPlans()
  const { progressCheckins, isLoading: isLoadingProgress } = useProgress()
  const { macrosHistory, isLoading: isLoadingMacros } = useNutrition()
  
  const [exportFormat, setExportFormat] = useState("xlsx")
  const [exportType, setExportType] = useState("workouts")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [remainingAttempts, setRemainingAttempts] = useState({ import: 5, export: 10 })

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: "xlsx",
      type: "workouts",
    },
  })

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Prepare the data based on export type
      let exportData
      switch (exportType) {
        case "workouts":
          exportData = workoutPlans
          break
        case "progress":
          exportData = progressCheckins
          break
        case "nutrition":
          exportData = macrosHistory
          break
        case "all":
          exportData = {
            workouts: workoutPlans,
            progress: progressCheckins,
            nutrition: macrosHistory,
          }
          break
      }
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportType,
          exportFormat,
          data: exportData,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        if (response.status === 429) {
          setRemainingAttempts(prev => ({ ...prev, export: 0 }))
          throw new Error(`Rate limit exceeded. Try again after ${new Date(error.resetTime).toLocaleTimeString()}`)
        }
        throw new Error('Export failed')
      }
      
      // Update remaining attempts
      const result = await response.json()
      if (result.remainingAttempts !== undefined) {
        setRemainingAttempts(prev => ({ ...prev, export: result.remainingAttempts }))
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `trainer-${exportType}-export.${exportFormat}`
      
      // Create a blob from the response and trigger download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`Your ${exportType} have been exported as ${exportFormat.toUpperCase()}.${
        result.remainingAttempts ? ` (${result.remainingAttempts} exports remaining)` : ''
      }`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : "There was an error exporting your data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      // Handle the response
      const response = await new Promise<{
        message: string
        remainingAttempts?: number
        success: boolean
      }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(xhr.responseText))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        
        xhr.open('POST', '/api/import')
        xhr.send(formData)
      })

      // Update remaining attempts
      if (response.remainingAttempts !== undefined) {
        setRemainingAttempts(prev => ({ 
          ...prev, 
          import: response.remainingAttempts ?? prev.import 
        }))
      }

      toast.success(`${response.message}${
        response.remainingAttempts ? ` (${response.remainingAttempts} imports remaining)` : ''
      }`)
    } catch (error) {
      console.error('Import error:', error)
      const errorData = error instanceof Error ? JSON.parse(error.message) : null
      
      if (errorData?.error === 'Rate limit exceeded') {
        setRemainingAttempts(prev => ({ ...prev, import: 0 }))
      }
      
      toast.error(errorData?.error || "There was an error importing your data. Please try again.")
    } finally {
      setIsImporting(false)
      setUploadProgress(0)
      // Reset the file input
      event.target.value = ''
    }
  }

  if (isLoadingWorkouts || isLoadingProgress || isLoadingMacros) {
    return <div>Loading data...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Export your workout plans, progress history, or nutrition data
            {remainingAttempts.export < 10 && (
              <div className="text-sm text-muted-foreground mt-1">
                {remainingAttempts.export} exports remaining
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Export Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        setExportType(value)
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select what to export" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="workouts">Workout Plans</SelectItem>
                        <SelectItem value="progress">Progress History</SelectItem>
                        <SelectItem value="nutrition">Nutrition Data</SelectItem>
                        <SelectItem value="all">All Data</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose what data you want to export
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Export Format</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        setExportFormat(value)
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select export format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the format for your exported data
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <Button 
                type="button" 
                onClick={handleExport}
                disabled={isExporting || remainingAttempts.export === 0}
              >
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Import your previously exported data
            {remainingAttempts.import < 5 && (
              <div className="text-sm text-muted-foreground mt-1">
                {remainingAttempts.import} imports remaining
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Choose File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.csv,.json,.pdf"
                onChange={handleImport}
                disabled={isImporting || remainingAttempts.import === 0}
              />
            </div>
            
            {isImporting && (
              <div className="space-y-2">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}