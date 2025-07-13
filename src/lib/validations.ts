import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration must be less than 4 hours"),
  meetingType: z.enum(["zoom", "google_meet"]),
  availableSlots: z.array(z.object({
    startTime: z.number(),
    endTime: z.number(),
    isAvailable: z.boolean(),
  })).optional(),
  businessHours: z.object({
    monday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    tuesday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    wednesday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    thursday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    friday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    saturday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
    sunday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  }),
});

export const bookMeetingSchema = z.object({
  meetingId: z.string().min(1, "Meeting ID is required"),
  attendeeName: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  attendeeEmail: z.string().email("Invalid email address"),
  message: z.string().optional(),
});

export const googleAuthSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  googleId: z.string().min(1, "Google ID is required"),
  profileImage: z.string().url().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type BookMeetingInput = z.infer<typeof bookMeetingSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;