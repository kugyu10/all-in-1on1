import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// オーナーの全予約を取得
export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    // オーナーのミーティングタイプを取得
    const ownerMeetings = await ctx.db
      .query("meetings")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    const meetingIds = ownerMeetings.map(m => m._id);
    
    // 各ミーティングタイプの予約を取得
    const allBookings = [];
    for (const meetingId of meetingIds) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_meeting", (q) => q.eq("meetingId", meetingId))
        .collect();
      
      // ミーティング情報を含めて結果に追加
      const meeting = ownerMeetings.find(m => m._id === meetingId);
      const bookingsWithMeeting = bookings.map(booking => ({
        ...booking,
        meeting: {
          title: meeting?.title || "不明",
          duration: meeting?.duration || 0,
          meetingType: meeting?.meetingType || "google_meet",
        }
      }));
      
      allBookings.push(...bookingsWithMeeting);
    }
    
    // 予約時間で降順ソート（新しい予約が上に）
    return allBookings.sort((a, b) => b.scheduledTime - a.scheduledTime);
  },
});

// 予約のステータス更新
export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("scheduled"), v.literal("cancelled"), v.literal("completed")),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("予約が見つかりません");
    }
    
    // オーナー権限チェック
    const meeting = await ctx.db.get(booking.meetingId);
    if (!meeting || meeting.ownerId !== args.ownerId) {
      throw new Error("この予約を変更する権限がありません");
    }
    
    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
    
    return { success: true };
  },
});

// 予約詳細を取得
export const getById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;
    
    const meeting = await ctx.db.get(booking.meetingId);
    
    return {
      ...booking,
      meeting: meeting ? {
        title: meeting.title,
        duration: meeting.duration,
        meetingType: meeting.meetingType,
        description: meeting.description,
      } : null,
    };
  },
});