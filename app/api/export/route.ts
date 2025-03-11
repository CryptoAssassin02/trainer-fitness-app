// Create file: app/api/export/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/utils/logger'
import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session.userId
  
  if (!userId) {
    logger.warn('Unauthorized attempt to export data')
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }
  
  try {
    const body = await req.json()
    const { exportType, exportFormat } = body
    
    logger.info('Starting data export', { userId, exportType, exportFormat })
    
    const supabase = createClient()
    let data: any = {}
    
    // Fetch data based on export type
    if (exportType === 'workouts' || exportType === 'all') {
      const { data: workoutPlans, error: workoutError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (workoutError) throw workoutError
      data.workouts = workoutPlans
    }
    
    if (exportType === 'progress' || exportType === 'all') {
      const { data: progressCheckins, error: progressError } = await supabase
        .from('progress_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (progressError) throw progressError
      data.progress = progressCheckins
    }
    
    if (exportType === 'nutrition' || exportType === 'all') {
      const { data: nutritionMacros, error: macroError } = await supabase
        .from('nutrition_macros')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (macroError) throw macroError
      data.nutrition = nutritionMacros
    }
    
    // Format data based on requested format
    let formattedData: Buffer | string
    let contentType: string
    let fileExtension: string
    
    switch (exportFormat) {
      case 'xlsx':
        const workbook = XLSX.utils.book_new()
        
        if (data.workouts) {
          const workoutSheet = XLSX.utils.json_to_sheet(data.workouts)
          XLSX.utils.book_append_sheet(workbook, workoutSheet, 'Workout Plans')
        }
        
        if (data.progress) {
          const progressSheet = XLSX.utils.json_to_sheet(data.progress)
          XLSX.utils.book_append_sheet(workbook, progressSheet, 'Progress History')
        }
        
        if (data.nutrition) {
          const nutritionSheet = XLSX.utils.json_to_sheet(data.nutrition)
          XLSX.utils.book_append_sheet(workbook, nutritionSheet, 'Macro Goals')
        }
        
        formattedData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break
        
      case 'csv':
        // For CSV, we'll only export the requested data type
        const csvData = data[exportType] || Object.values(data)[0]
        formattedData = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(csvData))
        contentType = 'text/csv'
        fileExtension = 'csv'
        break
        
      case 'json':
      default:
        formattedData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        fileExtension = 'json'
        break
    }
    
    // Generate filename
    const timestamp = format(new Date(), 'yyyy-MM-dd')
    const filename = `trainer-${exportType}-${timestamp}.${fileExtension}`
    
    logger.info('Successfully exported data', { userId, exportType, exportFormat })
    
    // Return the formatted data with appropriate headers
    return new NextResponse(formattedData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
    
  } catch (error) {
    logger.error('Error exporting data:', error, { userId })
    return new NextResponse(
      JSON.stringify({ error: 'Failed to export data' }),
      { status: 500 }
    )
  }
}