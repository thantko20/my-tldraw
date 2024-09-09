import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction
} from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { api } from "convex/_generated/api"
import { Id } from "convex/_generated/dataModel"
import { ConvexHttpClient } from "convex/browser"
import { useMutation } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { createTLStore, getSnapshot, loadSnapshot, Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id ?? ""
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!)
  const { draw, fileUrl } = await convex.query(api.tldraw.getSnapshot, {
    id: id as Id<"tldraw">
  })

  const snapshot = await fetch(fileUrl).then((res) => res.json())

  return json({ draw, snapshot })
}

export default function Draw() {
  const { draw, snapshot } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    loadSnapshot(newStore, snapshot)
    return newStore
  })

  const saveSnapshot = useMutation(api.tldraw.saveSnapshot)
  const generateSnapshotUrl = useMutation(api.tldraw.generateSnapshotUrl)

  const save = useCallback(async () => {
    try {
      const snapshot = getSnapshot(store)
      const url = await generateSnapshotUrl()

      const headers = new Headers()
      headers.set("Content-Type", "application/json")
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(snapshot)
      })
      const { storageId } = await response.json()
      await saveSnapshot({ id: draw!._id, storageId })
    } catch (error) {
      console.log(error)
    }
  }, [draw, generateSnapshotUrl, saveSnapshot, store])

  useEffect(() => {
    const onCtlS = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        save()
      }
    }

    window.addEventListener("keydown", onCtlS)

    return () => {
      window.removeEventListener("keydown", onCtlS)
    }
  }, [save])

  return (
    <div className="fixed inset-0">
      <Tldraw store={store} />
    </div>
  )
}
