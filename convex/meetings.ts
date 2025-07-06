import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    meetingType: v.union(v.literal("zoom"), v.literal("google_meet")),
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
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetings", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getById = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetingId);
  },
});

export const getAvailableSlots = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return null;
    
    // TODO: Implement calendar integration to generate actual available slots
    // For now, return empty array
    return [];
  },
});

export const bookSlot = mutation({
  args: {
    meetingId: v.id("meetings"),
    attendeeEmail: v.string(),
    attendeeName: v.string(),
    scheduledTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});