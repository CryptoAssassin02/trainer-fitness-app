// Create file: app/api/nutrition/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/utils/logger'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    logger.warn('Unauthorized attempt to calculate nutrition macros')
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }
  
  try {
    const body = await req.json()
    const { 
      gender, 
      age, 
      height, 
      weight, 
      activity, 
      goal,
      units
    } = body
    
    logger.info('Calculating nutrition macros', { userId, goal, activity, units })
    
    // Convert to metric if needed
    const weightKg = units === 'imperial' ? parseFloat(weight) * 0.453592 : parseFloat(weight)
    const heightCm = units === 'imperial' ? parseFloat(height) * 2.54 : parseFloat(height)
    
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseFloat(age) + 5
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseFloat(age) - 161
    }
    
    // Apply activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }
    
    const tdee = bmr * activityMultipliers[activity]
    
    // Adjust for goal
    const goalMultipliers: Record<string, number> = {
      lose: 0.8, // 20% deficit
      maintain: 1,
      gain: 1.15, // 15% surplus
    }
    
    const calories = Math.round(tdee * goalMultipliers[goal])
    
    // Calculate macros based on goal
    let proteinPct, carbPct, fatPct
    
    switch (goal) {
      case 'lose':
        proteinPct = 0.35 // 35%
        fatPct = 0.3 // 30%
        carbPct = 0.35 // 35%
        break
      case 'gain':
        proteinPct = 0.3 // 30%
        fatPct = 0.25 // 25%
        carbPct = 0.45 // 45%
        break
      default: // maintain
        proteinPct = 0.3 // 30%
        fatPct = 0.25 // 25%
        carbPct = 0.45 // 45%
    }
    
    // Calculate macros in grams
    const protein = Math.round((calories * proteinPct) / 4) // 4 calories per gram
    const carbs = Math.round((calories * carbPct) / 4) // 4 calories per gram
    const fat = Math.round((calories * fatPct) / 9) // 9 calories per gram
    
    logger.info('Successfully calculated macros', { userId, calories, protein, carbs, fat })
    return NextResponse.json({
      success: true,
      macros: {
        calories,
        protein,
        carbs,
        fat,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
      }
    })
    
  } catch (error) {
    logger.error('Error calculating macros:', error, { userId })
    return new NextResponse(
      JSON.stringify({ error: 'Failed to calculate macros' }),
      { status: 500 }
    )
  }
}