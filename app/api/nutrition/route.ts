import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('nutrition_macros')
      .select('*')
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
    
    // If this is marked as active, deactivate all other macro sets
    if (body.is_active) {
      await supabase
        .from('nutrition_macros')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true)
    }
    
    const { data, error } = await supabase
      .from('nutrition_macros')
      .insert([{ ...body, user_id: userId }])
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