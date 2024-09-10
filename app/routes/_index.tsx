import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/cloudflare"
import {
  json,
  Link,
  redirect,
  useFetcher,
  useLoaderData
} from "@remix-run/react"
import { nanoid } from "nanoid"
import slugify from "slugify"
import { z } from "zod"
import { fileListSchema } from "~/schema"

export const meta: MetaFunction = () => {
  return [
    { title: "Tldraw" },
    {
      name: "description",
      content: "Personal tldraw for Thant Ko"
    }
  ]
}

const schema = z.object({
  name: z.string()
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return json(
      { error: result.error.flatten().formErrors[0], status: "error" },
      400
    )
  }
  const env = context.cloudflare.env

  const id = nanoid()
  const slug = slugify(result.data.name)
  const filename = slug + ".json"
  const folder = "content"
  const objectKey = `/${folder}/${filename}`

  // create a new file in r2
  const object = await env.CONTENT_BUCKET.put(objectKey, "")
  if (!object) {
    return json({ error: "failed to create file", status: "error" }, 500)
  }

  // store the file info in d1 db
  const stmt = env.DB.prepare(
    "insert into files (id, name, key, filename, slug) values (?1, ?2, ?3, ?4, ?5)"
  ).bind(id, result.data.name, objectKey, filename)
  await stmt.run()

  return redirect(`/${id}`)
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env
  const stmt = env.DB.prepare("select * from files")
  const data = await stmt.all()
  if (data.error) {
    throw new Response("Failed to load data", { status: 500 })
  }
  const fileList = fileListSchema.parse(data.results)
  return { data: fileList }
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const busy = fetcher.state === "submitting"

  return (
    <div className="font-sans p-4">
      <div className="max-w-lg mx-auto">
        <fetcher.Form method="post" className="flex flex-col gap-2">
          <input
            name="name"
            type="text"
            placeholder="Enter name"
            className="border-2 border-gray-400 px-1 py-1 rounded-sm focus:border-blue-600 outline-none disabled:bg-blue-500"
          />
          <button
            className="bg-blue-600 text-gray-100 px-2 py-1 rounded"
            type="submit"
            disabled={busy}
          >
            {busy ? "Submitting..." : "Submit"}
          </button>
        </fetcher.Form>
        <div className="mt-4 flex flex-col gap-2">
          {data.map((item) => (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className="text-blue-600 hover:underline inline-block w-min"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
