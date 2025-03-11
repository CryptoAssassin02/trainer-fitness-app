import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return new NextResponse("Macro ID is required", { status: 400 })
    }

    const supabase = createClient()
    
    // First, deactivate all macro plans
    const { error: deactivateError } = await supabase
      .from('nutrition_macros')
      .update({ is_active: false })
      .eq('user_id', userId)
    
    if (deactivateError) {
      return new NextResponse(deactivateError.message, { status: 500 })
    }

    // Then, activate the selected plan
    const { data, error } = await supabase
      .from('nutrition_macros')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 