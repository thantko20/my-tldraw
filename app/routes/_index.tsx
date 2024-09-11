import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/cloudflare"
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation
} from "@remix-run/react"
import clsx from "clsx"
import { z } from "zod"
import { createTldraw, deleteTldraw } from "~/actions"
import { getTldraws } from "~/data"
import { createTldrawSchema, deleteTldrawSchema } from "~/schema"
import { handleActionError } from "~/utils"

export const meta: MetaFunction = () => {
  return [
    { title: "Tldraw" },
    {
      name: "description",
      content: "Personal tldraw for Thant Ko"
    }
  ]
}

const actionSchema = z.enum(["create", "delete"])

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData()
    const { _action, ...data } = Object.fromEntries(formData)
    const validAction = actionSchema.parse(_action)

    const env = context.cloudflare.env

    if (validAction === "create") {
      const validData = createTldrawSchema.parse(data)
      const { id } = await createTldraw(validData, env)

      return redirect(`/${id}`)
    }

    if (validAction === "delete") {
      const { id } = deleteTldrawSchema.parse(data)
      await deleteTldraw(id, env)
      return redirect("/")
    }

    return null
  } catch (error) {
    return handleActionError(error)
  }
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  return getTldraws(context.cloudflare.env)
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
