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
import { saveSnapshot } from "~/actions"
import { getTldrawById } from "~/data"
import { saveSnapshotSchema } from "~/schema"

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const id = z.string().parse(params.id)
  const result = await getTldrawById(id, context.cloudflare.env)
  return json(result)
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const rawJson = await request.json()
  const data = saveSnapshotSchema.parse(rawJson)
  await saveSnapshot(data, context.cloudflare.env)
  return null
}

export default function TldrawPage() {
  const { rawSnapshot, data } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    if (rawSnapshot !== "") {
      loadSnapshot(newStore, JSON.parse(rawSnapshot))
    }
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
