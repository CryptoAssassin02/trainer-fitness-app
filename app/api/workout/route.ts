import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/database.types"

export async function GET() {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_days (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('workout_plans')
      .insert([{ ...body, user_id: userId }])
      .select(`
        *,
        workout_days (*)
      `)
      .single()

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 