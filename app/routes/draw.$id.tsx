import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction
} from "@remix-run/cloudflare"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useCallback, useEffect, useState } from "react"
import { createTLStore, getSnapshot, loadSnapshot, Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

export const action = async () => {
  // const result = schema.safeParse(await request.json())
  // if (!result.success) {
  //   return new Response(JSON.stringify(result.error), {
  //     status: 400,
  //     headers: {
  //       "Content-Type": "application/json"
  //     }
  //   })
  // }
  // await writeFile(
  //   path.resolve(path.join("files", result.data.id)),
  //   result.data.snapshot
  // )
  return json({ message: "Success" })
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id ?? ""
  // const fileContent = await readFile(path.resolve(path.join("files", id)))

  // return json({ snapshot: JSON.parse(fileContent.toString("utf-8")), id })
  return json({ snapshot: {}, id })
}

export default function Draw() {
  const fetcher = useFetcher()
  const { snapshot, id } = useLoaderData<typeof loader>()
  const [store] = useState(() => {
    const newStore = createTLStore()
    loadSnapshot(newStore, snapshot)
    return newStore
  })

  const save = useCallback(async () => {
    try {
      const snapshot = getSnapshot(store)
      fetcher.submit(
        { snapshot: JSON.stringify(snapshot), id },
        { method: "POST", encType: "application/json" }
      )
    } catch (error) {
      console.log(error)
    }
  }, [store, fetcher, id])

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
