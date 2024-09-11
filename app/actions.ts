import slugify from "slugify"
import {
  CreateTldrawSchema,
  fileItemSchema,
  SaveSnapshotSchema
} from "./schema"
import { nanoid } from "nanoid"
import { createSessionStorage } from "./sessions"
import { redirect } from "@remix-run/cloudflare"

export const createTldraw = async (
  data: CreateTldrawSchema,
  { CONTENT_BUCKET, DB }: Pick<Env, "DB" | "CONTENT_BUCKET">
) => {
  const id = nanoid()
  const slug = slugify(data.name)
  const filename = slug + ".json"
  const folder = "content"
  const objectKey = `/${folder}/${filename}`

  const nameExists = await DB.prepare("select 1 from files where name = ?1")
    .bind(data.name)
    .first()

  if (nameExists) {
    throw new Response("Name already exists", { status: 400 })
  }

  // create a new file in r2
  const object = await CONTENT_BUCKET.put(objectKey, "", {
    httpMetadata: {
      contentType: "application/json"
    }
  })
  if (!object) {
    throw new Response("failed to create file", { status: 500 })
  }

  // store the file info in d1 db
  const stmt = DB.prepare(
    "insert into files (id, name, key, filename, slug) values (?1, ?2, ?3, ?4, ?5)"
  ).bind(id, data.name, objectKey, filename, slug)
  await stmt.run()

  return { id }
}

export const deleteTldraw = async (
  id: string,
  { DB, CONTENT_BUCKET }: Pick<Env, "DB" | "CONTENT_BUCKET">
) => {
  const record = await DB.prepare("select * from files where id = ?1")
    .bind(id)
    .first()
  if (record) {
    const file = fileItemSchema.parse(record)
    await DB.prepare("delete from files where id = ?1").bind(file.id).run()
    await CONTENT_BUCKET.delete(file.key)
  }
}

export const saveSnapshot = async (
  data: SaveSnapshotSchema,
  { CONTENT_BUCKET }: Pick<Env, "CONTENT_BUCKET">
) => {
  await CONTENT_BUCKET.put(data.key, data.snapshot, {
    httpMetadata: {
      contentType: "application/json"
    }
  })
}

export const verifySession = async (request: Request, env: Env) => {
  const { getSession } = createSessionStorage(env)
  const session = await getSession(request.headers.get("Cookie"))

  if (!session.has("userId")) {
    throw redirect(`/auth/login?redirect_url=${request.url}`)
  }
}
