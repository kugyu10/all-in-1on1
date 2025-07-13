import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { fetchAction, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

interface SessionWithAccessToken {
  accessToken?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const meetingId = searchParams.get('meetingId');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // ミーティング情報とオーナー情報を取得
    const meeting = await fetchQuery(api.meetings.getById, { meetingId: meetingId as any });
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const owner = await fetchQuery(api.users.getById, { id: meeting.ownerId });
    if (!owner) {
      return NextResponse.json({ error: 'Meeting owner not found' }, { status: 404 });
    }

    console.log("Calendar API - Owner info:", {
      ownerEmail: owner.email,
      hasRefreshToken: !!owner.refreshToken
    });

    if (!owner.refreshToken) {
      console.log("Owner has no refresh token, returning empty events");
      return NextResponse.json({ events: [] });
    }

    // オーナーのリフレッシュトークンを使ってアクセストークンを取得
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
      refresh_token: owner.refreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return NextResponse.json({ events: [] });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log("Calendar API - Attempting to fetch owner's events:", {
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate
    });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log("Calendar API - Successfully fetched events:", response.data.items?.length || 0);

    const events = response.data.items || [];
    
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary || 'No title',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Calendar API error - Full details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}