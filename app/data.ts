import { fileItemSchema, fileListSchema } from "./schema"

type Ctx = Env

export const getTldrawById = async (id: string, ctx: Ctx) => {
  const rawItem = await ctx.DB.prepare("select * from files where id = ?1")
    .bind(id)
    .first()

  const fileItem = fileItemSchema.parse(rawItem)
  const object = await ctx.CONTENT_BUCKET.get(fileItem.key)
  if (!object) {
    throw new Response("File not found", { status: 404 })
  }
  const rawSnapshot = await object.text()

  return { data: fileItem, rawSnapshot }
}

export const getTldraws = async (ctx: Ctx) => {
  const stmt = ctx.DB.prepare("select * from files")
  const data = await stmt.all()
  if (data.error) {
    throw new Response("Failed to load data", { status: 500 })
  }
  const fileList = fileListSchema.parse(data.results)
  return { data: fileList }
}
