import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/cloudflare"
import {
  Form,
  json,
  Link,
  redirect,
  useLoaderData,
  useNavigation
} from "@remix-run/react"
import clsx from "clsx"
import { nanoid } from "nanoid"
import slugify from "slugify"
import { z } from "zod"
import { fileItemSchema, fileListSchema } from "~/schema"

export const meta: MetaFunction = () => {
  return [
    { title: "Tldraw" },
    {
      name: "description",
      content: "Personal tldraw for Thant Ko"
    }
  ]
}

const createSchema = z.object({
  name: z.string(),
  _action: z.literal("create")
})

const deleteSchema = z.object({
  id: z.string(),
  _action: z.literal("delete")
})

const schema = z.union([createSchema, deleteSchema])

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

  if (result.data._action === "create") {
    const data = result.data
    const id = nanoid()
    const slug = slugify(data.name)
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
    ).bind(id, data.name, objectKey, filename, slug)
    await stmt.run()

    return redirect(`/${id}`)
  }

  if (result.data._action === "delete") {
    const record = await env.DB.prepare("select * from files where id = ?1")
      .bind(result.data.id)
      .first()
    if (record) {
      const file = fileItemSchema.parse(record)
      await env.DB.prepare("delete from files where id = ?1")
        .bind(file.id)
        .run()
      await env.CONTENT_BUCKET.delete(file.key)
    }
    return redirect("/")
  }

  return null
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
  const navigation = useNavigation()
  const busyCreating =
    navigation.formAction === "/?index" &&
    navigation.formData?.get("_action") === "create"

  return (
    <div className="font-sans p-4">
      <div className="max-w-lg mx-auto">
        <Form method="post" className="flex flex-col gap-2">
          <input
            name="name"
            type="text"
            placeholder="Enter name"
            className="border-2 border-gray-300 px-1 py-1 rounded focus:border-blue-600 outline-none"
            required
            disabled={busyCreating}
          />
          <button
            className="bg-blue-600 text-gray-100 px-2 py-1 rounded disabled:bg-blue-400"
            type="submit"
            disabled={busyCreating}
            name="_action"
            value="create"
          >
            {busyCreating ? "Creating..." : "Create"}
          </button>
        </Form>
        <div className="mt-4 flex flex-col gap-2">
          {data.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <Link
                to={`/${item.id}`}
                className="text-blue-600 hover:underline inline-block w-max"
              >
                {item.name}
              </Link>
              <Form method="post">
                <input type="hidden" name="id" value={item.id} />
                <button
                  name="_action"
                  value="delete"
                  className={clsx(
                    "text-red-400 underline text-sm hover:text-red-500 disabled:text-gray-400"
                  )}
                  disabled={
                    navigation.formAction === "/?index" &&
                    navigation.formData?.get("_action") === "delete" &&
                    navigation.formData?.get("id") === item.id
                  }
                >
                  Delete
                </button>
              </Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
