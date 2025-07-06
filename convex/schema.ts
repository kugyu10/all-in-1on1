import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    googleId: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    isOwner: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]).index("by_googleId", ["googleId"]),

  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    duration: v.number(), // in minutes
    availableSlots: v.optional(v.array(v.object({
      startTime: v.number(),
      endTime: v.number(),
      isAvailable: v.boolean(),
    }))),
    businessHours: v.object({
      monday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      tuesday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      wednesday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      thursday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      friday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      saturday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
      sunday: v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
      }),
    }),
    meetingType: v.union(v.literal("zoom"), v.literal("google_meet")),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  bookings: defineTable({
    meetingId: v.id("meetings"),
    attendeeEmail: v.string(),
    attendeeName: v.string(),
    scheduledTime: v.number(),
    status: v.union(v.literal("scheduled"), v.literal("cancelled"), v.literal("completed")),
    meetingLink: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_meeting", ["meetingId"]).index("by_attendee", ["attendeeEmail"]),

  googleCalendarIntegration: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    calendarId: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});