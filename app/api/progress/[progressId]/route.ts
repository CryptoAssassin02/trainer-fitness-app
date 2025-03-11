import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

export async function GET(
  req: Request,
  { params }: { params: { progressId: string } }
) {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('progress_checkins')
      .select('*')
      .eq('id', params.progressId)
      .eq('user_id', userId)
      .single()

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    if (!data) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { progressId: string } }
) {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('progress_checkins')
      .update(body)
      .eq('id', params.progressId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    if (!data) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { progressId: string } }
) {
  try {
    const session = await auth()
    const userId = session.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('progress_checkins')
      .delete()
      .eq('id', params.progressId)
      .eq('user_id', userId)

    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 