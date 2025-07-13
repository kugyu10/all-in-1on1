import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Convex connection...");
    console.log("CONVEX_URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // シンプルなクエリをテスト
    const meetings = await fetchQuery(api.meetings.getAllMeetings);
    
    console.log("Convex test successful, meetings count:", meetings.length);
    
    return NextResponse.json({ 
      success: true, 
      meetingsCount: meetings.length,
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL 
    });
  } catch (error) {
    console.error('Convex test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL 
    }, { status: 500 });
  }
}