import { Transition } from "@headlessui/react"
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect
} from "@remix-run/cloudflare"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { forwardRef, useCallback, useEffect, useState } from "react"
import { createTLStore, getSnapshot, loadSnapshot, Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import { saveSnapshot } from "~/actions"
import { getTldrawById } from "~/data"
import { saveSnapshotSchema } from "~/schema"
import { createSessionStorage } from "~/sessions"
import { handleActionError } from "~/utils"

export const loader = async ({
  context,
  params,
  request
}: LoaderFunctionArgs) => {
  const { getSession } = createSessionStorage(context.cloudflare.env)
  const session = await getSession(request.headers.get("Cookie"))
  if (!session.has("userId")) {
    return redirect(
      `/auth/login?redirect_url=${encodeURIComponent(request.url)}`
    )
  }
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

const Loader = forwardRef<HTMLDivElement>(function Loader(_, ref) {
  return (
    <div ref={ref} className="absolute duration-150 top-4 left-[50%] z-[9999]">
      <div className="loader"></div>
    </div>
  )
})

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

  const saveSnapshot = useCallback(() => {
    const snapshot = getSnapshot(store)
    fetcher.submit(
      { snapshot: JSON.stringify(snapshot), key: data.key },
      { method: "POST", encType: "application/json" }
    )
  }, [store, data.key, fetcher])

  const debouncedSaveSnapshot = useDebouncedCallback(saveSnapshot, 700)

  useEffect(() => {
    store.listen(
      () => {
        debouncedSaveSnapshot()
      },
      { scope: "document", source: "user" }
    )
  }, [store, debouncedSaveSnapshot])

  useEffect(() => {
    const abortController = new AbortController()
    const onSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        saveSnapshot()
      }
    }
    window.addEventListener("keydown", onSave, {
      signal: abortController.signal
    })
    return () => {
      abortController.abort()
    }
  }, [fetcher, store, data.key, saveSnapshot])

  return (
    <div className="fixed inset-0">
      <Tldraw store={store} />
      <Transition
        show={busySaving}
        enterFrom="-top-8"
        enterTo="top-4"
        leaveFrom="top-4"
        leaveTo="-top-8"
      >
        <Loader />
      </Transition>
    </div>
  )
}
