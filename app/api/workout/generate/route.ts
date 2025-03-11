// Create file: app/api/workout/generate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateCompletion } from '@/utils/ai/openai'
import { getExerciseResearch } from '@/utils/ai/perplexity'
import { logger } from '@/utils/logger'

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session.userId
  
  if (!userId) {
    logger.warn('Unauthorized attempt to generate workout plan')
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }
  
  try {
    const body = await req.json()
    const { 
      goal, 
      experience, 
      daysPerWeek, 
      duration, 
      equipment,
      preferences,
      injuries,
      includeCardio,
      includeMobility
    } = body
    
    logger.info('Generating workout plan', { userId, goal, experience, daysPerWeek })
    
    // Step 1: Gather exercise research with Perplexity AI
    const researchPrompt = `
      Gather scientific exercise research for a ${experience} level fitness enthusiast 
      with a primary goal of ${goal}. They have access to ${equipment} equipment,
      want to train ${daysPerWeek} days per week, for ${duration} minutes per session.
      ${preferences ? `They prefer: ${preferences}.` : ''}
      ${injuries ? `They have the following injuries/limitations: ${injuries}.` : ''}
      ${includeCardio ? 'Include cardio exercises.' : 'Do not include cardio exercises.'}
      ${includeMobility ? 'Include mobility/flexibility work.' : 'Do not include mobility/flexibility work.'}
      
      Focus on evidence-based training methodologies, optimal exercise selection, 
      and appropriate volume/intensity for their experience level.
    `
    
    // Call our Perplexity AI integration
    const researchResult = await getExerciseResearch({
      userContent: researchPrompt,
      max_tokens: 1500
    })
    
    // Step 2: Generate personalized workout plan using OpenAI with the research
    const workoutPrompt = `
      You are an expert fitness trainer. Create a personalized ${daysPerWeek}-day workout plan for a ${experience} level individual
      with a primary goal of ${goal}. They have access to ${equipment} equipment and 
      can train for ${duration} minutes per session.
      
      ${preferences ? `They prefer: ${preferences}.` : ''}
      ${injuries ? `They have the following injuries/limitations: ${injuries}.` : ''}
      ${includeCardio ? 'Include cardio exercises.' : 'Do not include cardio exercises.'}
      ${includeMobility ? 'Include mobility/flexibility work.' : 'Do not include mobility/flexibility work.'}
      
      Use this research to guide your plan: ${researchResult}
      
      Format the workout plan by day, including exercises, sets, reps, and rest periods.
      Add brief technique notes for each exercise. Include warm-up and cool-down.
    `
    
    // Call OpenAI to generate the plan
    const planResponse = await generateCompletion({
      chat: [{ role: "user", content: workoutPrompt }],
      maxTokens: 2000,
    })
    
    // Format the response
    logger.info('Successfully generated workout plan', { userId })
    return NextResponse.json({
      success: true,
      plan: planResponse,
    })
    
  } catch (error) {
    logger.error('Error generating workout plan:', error, { userId })
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate workout plan' }),
      { status: 500 }
    )
  }
}