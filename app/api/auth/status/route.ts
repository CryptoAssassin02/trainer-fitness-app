import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET handler for the auth status endpoint
 * Returns the current authentication status
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    return NextResponse.json({
      status: 'success',
      authenticated: !!userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        clerk: true
      }
    });
  } catch (error: unknown) {
    console.error('Auth status check error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'error',
      authenticated: false,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        clerk: false
      },
      error: process.env.NODE_ENV === 'production' ? 'Authentication service error' : errorMessage
    }, { status: 500 });
  }
} 