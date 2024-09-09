import { v } from "convex/values"
import { action, internalQuery, mutation, query } from "./_generated/server"
import { internal } from "./_generated/api"

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tldraw").collect()
  }
})

export const internalGetById = internalQuery({
  args: { id: v.id("tldraw") },
  handler(ctx, args) {
    return ctx.db.get(args.id)
  }
})

export const getById = query({
  args: { id: v.string() },
  handler(ctx, args) {
    return ctx.db
      .query("tldraw")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first()
  }
})

export const saveSnapshot = mutation({
  args: { storageId: v.id("_storage"), id: v.id("tldraw") },
  async handler(ctx, args) {
    await ctx.db.patch(args.id, { storageId: args.storageId })
  }
})

export const generateSnapshotUrl = mutation(async (ctx) => {
  return ctx.storage.generateUploadUrl()
})

export const getSnapshot = query({
  args: { id: v.id("tldraw") },
  async handler(ctx, args) {
    const draw = await ctx.db.get(args.id)
    if (!draw) {
      throw new Error("File not found")
    }
    const fileUrl = await ctx.storage.getUrl(draw.storageId)
    if (!fileUrl) {
      throw new Error("File not found")
    }
    return { draw, fileUrl }
  }
})
