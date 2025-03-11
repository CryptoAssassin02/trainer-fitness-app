import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/utils/logger'
import { createClient } from '@/utils/supabase/server'
import * as XLSX from 'xlsx'
import { importDataSchema } from '@/types/import-schemas'
import { importRateLimiter } from '@/utils/rate-limiter'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session.userId
  
  if (!userId) {
    logger.warn('Unauthorized attempt to import data')
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  // Check rate limit
  if (!importRateLimiter.check(userId)) {
    const resetTime = importRateLimiter.getResetTime(userId)
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        resetTime,
        remainingAttempts: 0,
      }),
      { status: 429 }
    )
  }
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds limit (10MB)')
    }

    // Validate file type
    if (!['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
        .includes(file.type)) {
      throw new Error('Invalid file type')
    }
    
    logger.info('Starting data import', { userId, fileName: file.name })
    
    // Read file content
    const fileBuffer = await file.arrayBuffer()
    let data: any = {}
    
    // Parse file based on type
    if (file.name.endsWith('.xlsx')) {
      const workbook = XLSX.read(fileBuffer)
      
      // Read each sheet if present
      if (workbook.SheetNames.includes('Workout Plans')) {
        data.workouts = XLSX.utils.sheet_to_json(workbook.Sheets['Workout Plans'])
      }
      if (workbook.SheetNames.includes('Progress History')) {
        data.progress = XLSX.utils.sheet_to_json(workbook.Sheets['Progress History'])
      }
      if (workbook.SheetNames.includes('Macro Goals')) {
        data.nutrition = XLSX.utils.sheet_to_json(workbook.Sheets['Macro Goals'])
      }
    } else if (file.name.endsWith('.csv')) {
      const worksheet = XLSX.read(fileBuffer).Sheets[XLSX.read(fileBuffer).SheetNames[0]]
      data = XLSX.utils.sheet_to_json(worksheet)
    } else if (file.name.endsWith('.json')) {
      const text = await file.text()
      data = JSON.parse(text)
    } else {
      throw new Error('Unsupported file format')
    }

    // Validate data structure
    const validationResult = importDataSchema.safeParse(data)
    if (!validationResult.success) {
      throw new Error(`Invalid data structure: ${validationResult.error.message}`)
    }

    const validatedData = validationResult.data
    const supabase = createClient()
    
    // Import workout plans
    if (validatedData.workouts?.length) {
      const { error: workoutError } = await supabase
        .from('workout_plans')
        .upsert(
          validatedData.workouts.map((plan) => ({
            ...plan,
            user_id: userId,
            created_at: plan.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        )
      
      if (workoutError) throw workoutError
    }
    
    // Import progress history
    if (validatedData.progress?.length) {
      const { error: progressError } = await supabase
        .from('progress_checkins')
        .upsert(
          validatedData.progress.map((entry) => ({
            ...entry,
            user_id: userId,
            created_at: entry.created_at || new Date().toISOString(),
          }))
        )
      
      if (progressError) throw progressError
    }
    
    // Import macro goals
    if (validatedData.nutrition?.length) {
      const { error: macroError } = await supabase
        .from('nutrition_macros')
        .upsert(
          validatedData.nutrition.map((goal) => ({
            ...goal,
            user_id: userId,
            created_at: goal.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        )
      
      if (macroError) throw macroError
    }
    
    const remainingAttempts = importRateLimiter.getRemainingAttempts(userId)
    logger.info('Successfully imported data', { userId })
    
    return NextResponse.json({
      success: true,
      message: 'Data imported successfully',
      remainingAttempts,
    })
    
  } catch (error) {
    logger.error('Error importing data:', error, { userId })
    const remainingAttempts = importRateLimiter.getRemainingAttempts(userId)
    
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to import data',
        remainingAttempts,
      }),
      { status: 500 }
    )
  }
} 