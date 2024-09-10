import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "Tldraw" },
    {
      name: "description",
      content: "Personal tldraw for Thant Ko"
    }
  ]
}

export default function Index() {
  return (
    <div className="font-sans p-4">
      <div>
        <Link to="/_" className="text-blue-600 hover:underline">
          Go to tldraw
        </Link>
      </div>
    </div>
  )
}
