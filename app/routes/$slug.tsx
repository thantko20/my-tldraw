import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs
} from "@remix-run/cloudflare"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { createTLStore, getSnapshot, loadSnapshot, Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import { z } from "zod"

const kvMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  filename: z.string()
})

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const slug = params.slug ?? ""
  if (!slug) {
    console.log("Slug not found")
    throw new Response("Id is missing", { status: 400 })
  }
  const env = context.cloudflare.env
  const rawKv = await env.TLDRAW.get(slug)
  if (!rawKv) {
    console.log("kv not found")
    throw new Response("File not found", { status: 404 })
  }

  const validKv = kvMetadataSchema.safeParse(JSON.parse(rawKv))

  if (!validKv.success) {
    console.log("kv not success", validKv.error)
    throw new Response("file not found", { status: 404 })
  }

  const object = await env.CONTENT_BUCKET.get(validKv.data.key)
  if (!object) {
    console.log("object not found")
    throw new Response("File not found", { status: 404 })
  }
  const raw = await object.text()
  return json({ data: validKv.data, raw, id: slug })
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const result: { id: string; snapshot: string; key: string } =
    await request.json()
  if (
    typeof result.id === "string" &&
    typeof result.snapshot === "string" &&
    typeof result.key === "string"
  ) {
    const env = context.cloudflare.env
    await env.CONTENT_BUCKET.put(result.key, result.snapshot)
  }
  return null
}

export default function TldrawPage() {
  const { raw, id, data } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    if (raw !== "") {
      loadSnapshot(newStore, JSON.parse(raw))
    }
    return newStore
  })

  const fetcher = useFetcher()

  useEffect(() => {
    const onSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        const snapshot = getSnapshot(store)
        fetcher.submit(
          { snapshot: JSON.stringify(snapshot), id, key: data.key },
          { method: "POST" }
        )
      }
    }
    window.addEventListener("keydown", onSave)
    return () => {
      window.removeEventListener("keydown", onSave)
    }
  }, [fetcher, store, id, data.key])

  return (
    <div className="fixed inset-0">
      <Tldraw store={store} />
    </div>
  )
}
