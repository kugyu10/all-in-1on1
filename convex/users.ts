import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    googleId: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    profileText: v.optional(v.string()),
    isOwner: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      googleId: args.googleId,
      profileImage: args.profileImage,
      profileText: args.profileText || "",
      isOwner: args.isOwner || false,
      isAdmin: args.isAdmin || false,
      createdAt: Date.now(),
    });
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getByGoogleId = query({
  args: { googleId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    profileText: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.profileText !== undefined) updateData.profileText = updates.profileText;
    if (updates.profileImage !== undefined) updateData.profileImage = updates.profileImage;

    return await ctx.db.patch(id, updateData);
  },
});

export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    googleId: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      const updateData: Record<string, any> = {
        name: args.name,
        googleId: args.googleId,
        profileImage: args.profileImage,
      };
      
      // refreshTokenが提供された場合のみ更新
      if (args.refreshToken) {
        updateData.refreshToken = args.refreshToken;
      }
      
      await ctx.db.patch(existingUser._id, updateData);
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        googleId: args.googleId,
        profileImage: args.profileImage,
        profileText: "",
        isOwner: false,
        isAdmin: false,
        refreshToken: args.refreshToken,
        createdAt: Date.now(),
      });
    }
  },
});

// 管理者用API
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    isOwner: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updateData: Record<string, any> = {};
    
    if (args.isOwner !== undefined) updateData.isOwner = args.isOwner;
    if (args.isAdmin !== undefined) updateData.isAdmin = args.isAdmin;

    return await ctx.db.patch(args.userId, updateData);
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.userId);
  },
});