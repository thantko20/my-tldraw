import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/cloudflare"
import { Form, Link, redirect, useLoaderData } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "Tldraw" },
    {
      name: "description",
      content: "Personal tldraw for Thant Ko"
    }
  ]
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name")
  if (!name) {
    return new Response("Name is missing", { status: 400 })
  }
  const env = context.cloudflare.env

  const id = Date.now().toString()
  const filename = Date.now().toString() + ".json"
  const key = `/content/${filename}`

  // create a new file in r2
  const object = await env.CONTENT_BUCKET.put(key, "")
  if (!object) {
    return new Response("Failed to create file", { status: 500 })
  }

  // store the file metadata in kv
  await env.TLDRAW.put(
    id,
    JSON.stringify({
      id,
      name,
      key,
      filename
    })
  )
  return redirect(`/_/${id}`)
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env
  const kvs = await env.TLDRAW.list()
  return { keys: kvs.keys }
}

export default function Index() {
  const { keys } = useLoaderData<typeof loader>()
  console.log(keys)

  return (
    <div className="font-sans p-4">
      <div className="max-w-lg mx-auto">
        <Link to="/_" className="text-blue-600 hover:underline">
          Go to tldraw
        </Link>
        <Form method="post">
          <input name="name" type="text" placeholder="Enter name" />
          <button
            className="bg-blue-600 text-gray-100 px-2 py-1 rounded"
            type="submit"
          >
            Submit
          </button>
        </Form>
        <div className="mt-4">
          {keys.map((key) => (
            <Link
              key={key.name}
              to={`/_/${key.name}`}
              className="text-blue-600 hover:underline"
            >
              {key.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
