import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { fetchQuery, fetchMutation } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const { meetingId, bookingId, attendeeName, attendeeEmail, scheduledTime, message } = await request.json();

    console.log("Creating calendar event:", {
      meetingId,
      bookingId,
      attendeeName,
      attendeeEmail,
      scheduledTime: new Date(scheduledTime),
      message
    });

    // ミーティング情報とオーナー情報を取得
    const meeting = await fetchQuery(api.meetings.getById, { meetingId: meetingId as any });
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const owner = await fetchQuery(api.users.getById, { id: meeting.ownerId });
    if (!owner) {
      return NextResponse.json({ error: 'Meeting owner not found' }, { status: 404 });
    }

    console.log("Owner info:", {
      ownerEmail: owner.email,
      hasRefreshToken: !!owner.refreshToken
    });

    if (!owner.refreshToken) {
      console.log("Owner has no refresh token, cannot create calendar event");
      return NextResponse.json({ 
        success: false, 
        error: 'Owner calendar not connected' 
      });
    }

    // OAuth2クライアントを設定
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
      console.log("Access token refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to access owner calendar',
        details: error instanceof Error ? error.message : 'Token refresh failed'
      });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // イベントの開始・終了時間を計算
    const startTime = new Date(scheduledTime);
    const endTime = new Date(scheduledTime + meeting.duration * 60000); // durationは分単位

    // カレンダーイベントを作成
    const event: any = {
      summary: `${meeting.title} - ${attendeeName}`,
      description: [
        `ミーティングタイプ: ${meeting.title}`,
        `参加者: ${attendeeName} (${attendeeEmail})`,
        meeting.description ? `説明: ${meeting.description}` : '',
        message ? `メッセージ: ${message}` : '',
        ``,
        `予約ID: ${bookingId}`,
      ].filter(line => line !== '').join('\n'),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      attendees: [
        { email: owner.email },
        { email: attendeeEmail },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1日前
          { method: 'popup', minutes: 10 }, // 10分前
        ],
      },
    };

    // Google Meetの場合、自動でリンクを生成
    if (meeting.meetingType === 'google_meet') {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${bookingId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    console.log("Creating calendar event with data:", event);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // 参加者全員に通知を送信
      conferenceDataVersion: meeting.meetingType === 'google_meet' ? 1 : 0, // Google Meet用
    });

    console.log("Calendar event created successfully:", {
      eventId: response.data.id,
      eventUrl: response.data.htmlLink
    });

    // 予約にカレンダーイベントIDを保存
    if (response.data.id) {
      try {
        await fetchMutation(api.meetings.updateBookingCalendarEvent, {
          bookingId: bookingId as any,
          calendarEventId: response.data.id,
        });
        console.log("Updated booking with calendar event ID");
      } catch (updateError) {
        console.error("Failed to update booking with calendar event ID:", updateError);
        // エラーでも続行
      }
    }

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventUrl: response.data.htmlLink,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

  } catch (error) {
    console.error('Calendar event creation error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // スコープ不足の場合の特別な処理
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isInsufficientScope = errorMessage.includes('insufficient authentication scopes');
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create calendar event',
      details: errorMessage,
      requiresReauth: isInsufficientScope,
      message: isInsufficientScope 
        ? 'オーナーはカレンダー書き込み権限で再ログインが必要です' 
        : 'カレンダーイベントの作成に失敗しました'
    }, { status: 500 });
  }
}