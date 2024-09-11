import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/cloudflare"
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react"
import { z } from "zod"
import { createTldraw, deleteTldraw } from "~/actions"
import { TldrawItem } from "~/components/tldraw-item"
import { getTldraws } from "~/data"
import { createTldrawSchema, deleteTldrawSchema } from "~/schema"
import { createSessionStorage } from "~/sessions"
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

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { getSession } = createSessionStorage(context.cloudflare.env)
  const session = await getSession(request.headers.get("Cookie"))
  if (!session.has("userId")) {
    return redirect(
      `/auth/login?redirect_url=${encodeURIComponent(request.url)}`
    )
  }
  return getTldraws(context.cloudflare.env)
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const navigation = useNavigation()
  const busyCreating =
    navigation.formAction === "/?index" &&
    navigation.formData?.get("_action") === "create"

  return (
    <div className="font-sans p-4">
      <div className="max-w-lg mx-auto">
        {actionData?.message ? (
          <div
            className="bg-red-500/20 text-red-500 p-2 rounded border border-red-500"
            role="alert"
          >
            {actionData.message}
          </div>
        ) : null}
        <Form method="post" className="mt-2">
          <fieldset disabled={busyCreating} className="flex flex-col gap-2">
            <input
              name="name"
              type="text"
              placeholder="Enter name"
              className="border-2 border-gray-300 px-1 py-1 rounded focus:border-blue-600 outline-none disabled:border-gray-200 disabled:text-gray-400"
              required
            />
            <button
              className="bg-blue-600 text-gray-100 px-2 py-1 rounded disabled:bg-blue-400"
              type="submit"
              name="_action"
              value="create"
            >
              {busyCreating ? "Creating..." : "Create"}
            </button>
          </fieldset>
        </Form>
        <div className="mt-4 flex flex-col gap-2">
          {data.map((item) => (
            <TldrawItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
