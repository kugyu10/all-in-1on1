import { google } from "googleapis";
// import { getServerSession } from "next-auth";

export async function getGoogleCalendarClient(accessToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    // For server-side usage, we'll use placeholder tokens for now
    oauth2Client.setCredentials({
      access_token: "placeholder_access_token",
      refresh_token: "placeholder_refresh_token",
    });
  }

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getAvailableTimeSlots(
  startDate: Date,
  endDate: Date,
  duration: number = 30
) {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busy = response.data.calendars?.primary?.busy || [];
    const slots = [];

    // Generate time slots based on busy periods
    let currentTime = new Date(startDate);
    
    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      // Check if this slot conflicts with any busy periods
      const isConflict = busy.some(busyPeriod => {
        const busyStart = new Date(busyPeriod.start!);
        const busyEnd = new Date(busyPeriod.end!);
        return currentTime < busyEnd && slotEnd > busyStart;
      });

      if (!isConflict) {
        slots.push({
          startTime: currentTime.getTime(),
          endTime: slotEnd.getTime(),
          isAvailable: true,
        });
      }

      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    return slots;
  } catch (error) {
    console.error("Error fetching calendar availability:", error);
    return [];
  }
}

export async function createGoogleMeetEvent(
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  attendeeEmail: string
) {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const event = {
      summary: title,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        { email: attendeeEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return {
      eventId: response.data.id,
      meetingLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
    };
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    throw error;
  }
}