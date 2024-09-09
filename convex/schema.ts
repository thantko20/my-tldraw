import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tasks: defineTable({
    isCompleted: v.boolean(),
    text: v.string()
  }),
  tldraw: defineTable({
    key: v.string(),
    name: v.string(),
    value: v.optional(v.string()),
    storageId: v.id("_storage")
  })
})
