import { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const objects = await context.cloudflare.env.CONTENT_BUCKET.list()
  console.log(objects)
  return null
}

export default function TldrawPage() {
  return (
    <div className="fixed inset-0">
      <Tldraw />
    </div>
  )
}
