// Create file: app/api/workout/generate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateCompletion } from '@/utils/ai/openai'
import { getExerciseResearch } from '@/utils/ai/perplexity'
import { logger } from '@/utils/logger'

// Function to generate a simulated workout plan for development and fallback
function generateSimulatedWorkoutPlan(
  goal: string,
  experience: string,
  daysPerWeek: number,
  duration: number,
  equipment: string,
  includeCardio: boolean,
  includeMobility: boolean
): string {
  const intensityMap = {
    'beginner': 'moderate',
    'intermediate': 'challenging',
    'advanced': 'intense'
  };
  const intensity = intensityMap[experience as keyof typeof intensityMap] || 'moderate';
  
  const goalFocus = {
    'strength': 'compound lifts and progressive overload',
    'muscle': 'hypertrophy training with moderate to high volume',
    'endurance': 'higher repetitions and circuit-style training',
    'weightloss': 'metabolic conditioning and calorie-burning exercises',
    'recomp': 'balanced resistance training and conditioning',
    'general': 'functional fitness and balanced development'
  };
  const focus = goalFocus[goal as keyof typeof goalFocus] || 'balanced training';
  
  let workoutPlan = `# ${goal.charAt(0).toUpperCase() + goal.slice(1)} Workout Plan for ${experience.charAt(0).toUpperCase() + experience.slice(1)} Level\n\n`;
  workoutPlan += `This ${daysPerWeek}-day workout plan focuses on ${focus} using ${equipment} equipment. Each workout is designed to be completed in approximately ${duration} minutes.\n\n`;
  
  // Generate workouts for each day
  for (let day = 1; day <= daysPerWeek; day++) {
    const isRestDay = day === 3 || day === 7; // Make day 3 and 7 rest days if they exist in the plan
    
    if (isRestDay) {
      workoutPlan += `## Day ${day}: Rest and Recovery\n\n`;
      workoutPlan += `- Focus on adequate sleep (7-9 hours)\n`;
      workoutPlan += `- Stay hydrated and maintain nutrition\n`;
      workoutPlan += `- Light stretching or walking if desired\n\n`;
      continue;
    }
    
    // Create workout type based on day and goal
    let workoutType = '';
    if (goal === 'strength') {
      workoutType = day % 2 === 0 ? 'Upper Body Strength' : 'Lower Body Strength';
    } else if (goal === 'muscle') {
      const types = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body'];
      workoutType = types[day % types.length] + ' Hypertrophy';
    } else if (goal === 'endurance' || goal === 'weightloss') {
      workoutType = 'Full Body Circuit';
    } else {
      const types = ['Upper Body', 'Lower Body', 'Full Body', 'Core and Conditioning'];
      workoutType = types[day % types.length];
    }
    
    workoutPlan += `## Day ${day}: ${workoutType}\n\n`;
    
    // Warm-up
    workoutPlan += `### Warm-up (5-10 minutes)\n`;
    workoutPlan += `- Dynamic stretching\n`;
    workoutPlan += `- Light cardio to increase heart rate\n`;
    workoutPlan += `- Joint mobility exercises\n\n`;
    
    // Main workout
    workoutPlan += `### Main Workout (${duration - 15} minutes)\n\n`;
    
    const exercises = [];
    if (workoutType.includes('Upper')) {
      exercises.push(
        { name: 'Push-ups or Bench Press', sets: '3-4', reps: '8-12', rest: '60-90 sec' },
        { name: 'Rows or Pull-ups', sets: '3-4', reps: '8-12', rest: '60-90 sec' },
        { name: 'Shoulder Press', sets: '3', reps: '10-12', rest: '60 sec' },
        { name: 'Bicep Curls', sets: '3', reps: '12-15', rest: '45 sec' },
        { name: 'Tricep Extensions', sets: '3', reps: '12-15', rest: '45 sec' }
      );
    } else if (workoutType.includes('Lower')) {
      exercises.push(
        { name: 'Squats', sets: '3-4', reps: '8-12', rest: '90-120 sec' },
        { name: 'Deadlifts', sets: '3-4', reps: '8-10', rest: '90-120 sec' },
        { name: 'Lunges', sets: '3', reps: '10-12 each leg', rest: '60 sec' },
        { name: 'Leg Press or Step-ups', sets: '3', reps: '12-15', rest: '60 sec' },
        { name: 'Calf Raises', sets: '3', reps: '15-20', rest: '45 sec' }
      );
    } else if (workoutType.includes('Full')) {
      exercises.push(
        { name: 'Squats', sets: '3', reps: '10-12', rest: '60 sec' },
        { name: 'Push-ups or Bench Press', sets: '3', reps: '10-12', rest: '60 sec' },
        { name: 'Rows', sets: '3', reps: '10-12', rest: '60 sec' },
        { name: 'Lunges', sets: '3', reps: '10-12 each leg', rest: '60 sec' },
        { name: 'Shoulder Press', sets: '3', reps: '10-12', rest: '60 sec' }
      );
    } else if (workoutType.includes('Core')) {
      exercises.push(
        { name: 'Plank', sets: '3', reps: '30-60 sec hold', rest: '45 sec' },
        { name: 'Russian Twists', sets: '3', reps: '15-20 each side', rest: '45 sec' },
        { name: 'Mountain Climbers', sets: '3', reps: '20-30 each leg', rest: '45 sec' },
        { name: 'Bicycle Crunches', sets: '3', reps: '15-20 each side', rest: '45 sec' },
        { name: 'Leg Raises', sets: '3', reps: '12-15', rest: '45 sec' }
      );
    }
    
    exercises.forEach(exercise => {
      workoutPlan += `#### ${exercise.name}\n`;
      workoutPlan += `- **Sets:** ${exercise.sets}\n`;
      workoutPlan += `- **Reps:** ${exercise.reps}\n`;
      workoutPlan += `- **Rest:** ${exercise.rest}\n`;
      workoutPlan += `- **Notes:** Focus on proper form and control throughout the movement.\n\n`;
    });
    
    // Cardio (if included)
    if (includeCardio) {
      workoutPlan += `### Cardio (10-15 minutes)\n`;
      workoutPlan += `- Choose from: jogging, cycling, rowing, or interval training\n`;
      workoutPlan += `- Maintain ${intensity === 'intense' ? 'high' : intensity} intensity\n\n`;
    }
    
    // Mobility (if included)
    if (includeMobility) {
      workoutPlan += `### Cool-down and Mobility (5-10 minutes)\n`;
      workoutPlan += `- Static stretching for major muscle groups\n`;
      workoutPlan += `- Foam rolling for any tight areas\n`;
      workoutPlan += `- Deep breathing and relaxation\n\n`;
    } else {
      workoutPlan += `### Cool-down (5 minutes)\n`;
      workoutPlan += `- Light stretching\n`;
      workoutPlan += `- Deep breathing\n\n`;
    }
  }
  
  // Add general guidelines
  workoutPlan += `## General Guidelines\n\n`;
  workoutPlan += `- Always warm up properly before each workout\n`;
  workoutPlan += `- Stay hydrated throughout your workouts\n`;
  workoutPlan += `- Increase weights gradually as you get stronger\n`;
  workoutPlan += `- Get adequate protein and nutrition to support recovery\n`;
  workoutPlan += `- Ensure you're getting enough sleep (7-9 hours)\n`;
  workoutPlan += `- Listen to your body and take extra rest if needed\n`;
  
  return workoutPlan;
}

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
    
    let researchResult;
    try {
      // Call our Perplexity AI integration
      researchResult = await getExerciseResearch({
        userContent: researchPrompt,
        max_tokens: 1500
      });
      logger.info('Successfully retrieved exercise research');
    } catch (researchError) {
      logger.error('Error getting exercise research:', researchError);
      // Continue without research if it fails
      researchResult = "Unable to retrieve research data. Proceeding with plan generation based on fitness fundamentals.";
    }
    
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
    
    let planResponse;
    try {
      // Try to generate with OpenAI
      logger.info('Calling OpenAI to generate workout plan');
      planResponse = await generateCompletion({
        chat: [
          { role: "system", content: "You are an expert fitness trainer specializing in creating personalized workout plans." },
          { role: "user", content: workoutPrompt }
        ],
        maxTokens: 3000
      });
      logger.info('Successfully generated workout plan with OpenAI');
    } catch (openaiError) {
      // Log the error
      logger.error('Error generating workout plan with OpenAI:', openaiError);
      
      // Fall back to simulated plan
      logger.info('Falling back to simulated workout plan');
      planResponse = generateSimulatedWorkoutPlan(
        goal,
        experience,
        daysPerWeek,
        duration,
        equipment,
        includeCardio,
        includeMobility
      );
      
      // Log that we're using the fallback
      logger.info('Using simulated workout plan as fallback');
    }
    
    // Return the plan
    return NextResponse.json({ plan: planResponse })
    
  } catch (error) {
    logger.error('Error in workout plan generation:', error);
    
    // Try to extract a meaningful error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while generating your workout plan';
    
    // Return a helpful error response
    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        suggestion: "Please try again or use different parameters."
      }), 
      { status: 500 }
    );
  }
}