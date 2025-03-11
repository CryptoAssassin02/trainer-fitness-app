import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Health check API endpoint
 * Used to verify the application and its dependencies are working correctly
 */
export async function GET() {
  try {
    const supabase = createClient();
    let databaseConnected = false;
    
    // Check database connection
    try {
      const { data, error } = await supabase.from('perplexity_cache').select('id').limit(1);
      databaseConnected = !error;
    } catch (e) {
      databaseConnected = false;
    }
    
    // Build health status
    const status = {
      healthy: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: databaseConnected
      },
      services: {
        perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        clerk: Boolean(process.env.CLERK_SECRET_KEY)
      }
    };
    
    return NextResponse.json(status);
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: "Health check failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 