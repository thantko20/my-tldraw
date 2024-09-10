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
import { fileItemSchema } from "~/schema"

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const id = params.id ?? ""
  if (!id) {
    console.log("Slug not found")
    throw new Response("Id is missing", { status: 400 })
  }
  const env = context.cloudflare.env
  const rawItem = await env.DB.prepare("select * from files where id = ?1")
    .bind(id)
    .first()

  const fileItem = fileItemSchema.parse(rawItem)
  const object = await env.CONTENT_BUCKET.get(fileItem.key)
  if (!object) {
    console.log("object not found")
    throw new Response("File not found", { status: 404 })
  }
  const snapshot = await object.json()
  return json({ data: fileItem, snapshot })
}

const schema = z.object({
  snapshot: z.string(),
  key: z.string()
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const rawJson = await request.json()
  const result = schema.parse(rawJson)
  const env = context.cloudflare.env
  await env.CONTENT_BUCKET.put(result.key, result.snapshot)
  return null
}

export default function TldrawPage() {
  const { snapshot, data } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    loadSnapshot(newStore, snapshot as object)
    return newStore
  })

  const fetcher = useFetcher()
  const busy = fetcher.state === "submitting"

  useEffect(() => {
    const onSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        const snapshot = getSnapshot(store)
        fetcher.submit(
          { snapshot: JSON.stringify(snapshot), key: data.key },
          { method: "POST", encType: "application/json" }
        )
      }
    }
    window.addEventListener("keydown", onSave)
    return () => {
      window.removeEventListener("keydown", onSave)
    }
  }, [fetcher, store, data.key])

  return (
    <div className="fixed inset-0">
      {busy ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 grid place-content-center">
          Loading
        </div>
      ) : null}
      <Tldraw store={store} />
    </div>
  )
}
