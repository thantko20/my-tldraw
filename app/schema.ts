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
