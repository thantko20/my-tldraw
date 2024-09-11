import { z } from "zod"

export const fileItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  filename: z.string(),
  slug: z.string()
})

export type FileItem = z.infer<typeof fileItemSchema>

export const fileListSchema = z.array(fileItemSchema)
export type FileList = z.infer<typeof fileListSchema>

export const createTldrawSchema = z.object({
  name: z.string()
})

export type CreateTldrawSchema = z.infer<typeof createTldrawSchema>

export const deleteTldrawSchema = z.object({
  id: z.string()
})

export type DeleteTldrawSchema = z.infer<typeof deleteTldrawSchema>

export const saveSnapshotSchema = z.object({
  key: z.string(),
  snapshot: z.string()
})

export type SaveSnapshotSchema = z.infer<typeof saveSnapshotSchema>
