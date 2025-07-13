import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 既存のユーザーにisAdminフィールドを追加するマイグレーション
export const addIsAdminField = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      // isAdminフィールドが存在しない場合のみ追加
      if (!('isAdmin' in user)) {
        await ctx.db.patch(user._id, {
          isAdmin: false, // デフォルトは非管理者
        });
      }
    }
    
    return { 
      message: `${users.length}人のユーザーにisAdminフィールドを追加しました`,
      updatedCount: users.filter(user => !('isAdmin' in user)).length
    };
  },
});

// 特定のユーザーを管理者に設定する関数
export const makeUserAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user) {
      throw new Error(`ユーザーが見つかりません: ${args.email}`);
    }
    
    await ctx.db.patch(user._id, {
      isAdmin: true,
    });
    
    return { 
      message: `${user.name} (${user.email}) を管理者に設定しました`,
      userId: user._id 
    };
  },
});