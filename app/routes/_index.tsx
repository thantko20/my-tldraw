import { type MetaFunction } from "@remix-run/node"
import { json, Link, useLoaderData } from "@remix-run/react"
import { api } from "convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import "tldraw/tldraw.css"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

const loader = async () => {
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!)
  const tldraws = await convex.query(api.tldraw.get)
  console.log(tldraws)
  return json({ tldraws })
}

export default function Index() {
  const { tldraws } = useLoaderData<typeof loader>()
  return tldraws.map((draw) => (
    <Link key={draw._id} to={`/draw/${draw._id}`}>
      {draw.name}
    </Link>
  ))
}
