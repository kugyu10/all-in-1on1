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
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});

// 管理者用API
export const getAllMeetings = query({
  handler: async (ctx) => {
    return await ctx.db.query("meetings")
      .order("desc")
      .collect();
  },
});

export const updateMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { meetingId, ...updates } = args;
    const updateData: Record<string, any> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    return await ctx.db.patch(meetingId, updateData);
  },
});

export const deleteMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.meetingId);
  },
});

// オーナー用の削除機能（予約チェック付き）
export const deleteOwnerMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // ミーティングの所有者チェック
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) {
      throw new Error("ミーティングが見つかりません");
    }
    
    if (meeting.ownerId !== args.ownerId) {
      throw new Error("このミーティングを削除する権限がありません");
    }
    
    // アクティブな予約があるかチェック
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    if (activeBookings.length > 0) {
      throw new Error(`このミーティングには${activeBookings.length}件の予約があるため削除できません`);
    }
    
    // 予約がない場合は削除を実行
    await ctx.db.delete(args.meetingId);
    return { success: true, message: "ミーティングタイプを削除しました" };
  },
});

// ミーティングの予約数を取得
export const getMeetingBookingCount = query({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    return bookings.length;
  },
});

// 予約にカレンダーイベントIDを追加
export const updateBookingCalendarEvent = mutation({
  args: {
    bookingId: v.id("bookings"),
    calendarEventId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      calendarEventId: args.calendarEventId,
    });
    return { success: true };
  },
});