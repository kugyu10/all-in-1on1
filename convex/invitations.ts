import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ランダムトークン生成関数
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 招待トークンを作成
export const createInvitation = mutation({
  args: {
    email: v.optional(v.string()),
    role: v.union(v.literal("owner"), v.literal("admin")),
    expiresInHours: v.optional(v.number()), // デフォルト24時間
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 作成者が管理者かチェック
    const creator = await ctx.db.get(args.createdBy);
    if (!creator || !creator.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    const token = generateToken();
    const expiresAt = Date.now() + (args.expiresInHours || 24) * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("invitationTokens", {
      token,
      email: args.email,
      role: args.role,
      isUsed: false,
      expiresAt,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    return {
      id: invitationId,
      token,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`,
      expiresAt,
    };
  },
});

// 招待トークンを検証
export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return { valid: false, error: "無効なトークンです" };
    }

    if (invitation.isUsed) {
      return { valid: false, error: "このトークンは既に使用されています" };
    }

    if (invitation.expiresAt < Date.now()) {
      return { valid: false, error: "トークンの有効期限が切れています" };
    }

    return {
      valid: true,
      invitation: {
        role: invitation.role,
        email: invitation.email,
      },
    };
  },
});

// 招待トークンを使用してユーザーをアップグレード
export const useInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("無効なトークンです");
    }

    if (invitation.isUsed) {
      throw new Error("このトークンは既に使用されています");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("トークンの有効期限が切れています");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }

    // 特定のメールアドレス用の招待の場合、メールアドレスをチェック
    if (invitation.email && user.email !== invitation.email) {
      throw new Error("この招待は他のユーザー用です");
    }

    // ユーザーの権限を更新
    const updateData: Record<string, any> = {};
    if (invitation.role === "owner") {
      updateData.isOwner = true;
    } else if (invitation.role === "admin") {
      updateData.isAdmin = true;
    }

    await ctx.db.patch(args.userId, updateData);

    // トークンを使用済みにマーク
    await ctx.db.patch(invitation._id, {
      isUsed: true,
      usedBy: args.userId,
    });

    return { success: true, role: invitation.role };
  },
});

// 管理者用：全ての招待トークンを取得
export const getAllInvitations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("invitationTokens")
      .order("desc")
      .collect();
  },
});

// 招待トークンを削除
export const deleteInvitation = mutation({
  args: {
    invitationId: v.id("invitationTokens"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 削除者が管理者かチェック
    const deleter = await ctx.db.get(args.deletedBy);
    if (!deleter || !deleter.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    await ctx.db.delete(args.invitationId);
    return { success: true };
  },
});