import { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { createTLStore, loadSnapshot, Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const id = params.id ?? ""
  if (!id) {
    return new Response("Id is missing", { status: 400 })
  }
  const env = context.cloudflare.env
  const kv = await env.TLDRAW.get(id)
  if (!kv) {
    return new Response("File not found", { status: 404 })
  }
  const object = await env.CONTENT_BUCKET.get(id)
  if (!object) {
    return new Response("File not found", { status: 404 })
  }
  const raw = await object.text()
  return { kv, raw }
}

export default function TldrawPage() {
  //@ts-expect-error expect err
  const { raw } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    if (raw !== "") {
      loadSnapshot(newStore, JSON.parse(raw))
    }
    return newStore
  })
  console.log({ raw })
  return (
    <div className="fixed inset-0">
      <Tldraw store={store} />
    </div>
  )
}
