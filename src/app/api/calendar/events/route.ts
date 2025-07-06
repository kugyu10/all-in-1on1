import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

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
    const session = await getServerSession(authOptions) as SessionWithAccessToken;
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    });

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
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}