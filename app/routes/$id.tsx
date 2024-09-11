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
import { handleActionError } from "~/utils"

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const id = z.string().parse(params.id)
  const result = await getTldrawById(id, context.cloudflare.env)
  return json(result)
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    const rawJson = await request.json()
    const data = saveSnapshotSchema.parse(rawJson)
    await saveSnapshot(data, context.cloudflare.env)
    return null
  } catch (error) {
    return handleActionError(error)
  }
}

export default function TldrawPage() {
  const { rawSnapshot, data } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const busySaving = fetcher.state === "submitting"

  // const assetFetcher = useFetcher()

  const [store] = useState(() => {
    const newStore = createTLStore({
      assets: {
        async upload(_asset, file) {
          const response = await fetch(
            `/api/uploads/${encodeURIComponent(file.name)}`,
            {
              method: "PUT",
              body: file
            }
          )

          if (!response.ok) {
            console.log(response)
            throw new Error("Failed to upload assets")
          }
          const rawJson = await response.json()
          const { url } = z.object({ url: z.string() }).parse(rawJson)
          return url
        },
        resolve(asset) {
          return asset.props.src
        }
      }
    })
    if (rawSnapshot !== "") {
      loadSnapshot(newStore, JSON.parse(rawSnapshot))
    }
    return newStore
  })

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
      <Tldraw store={store} />
      {busySaving ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] grid place-content-center text-gray-100 text-xl font-semibold">
          Saving
        </div>
      ) : null}
    </div>
  )
}
