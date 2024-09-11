import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect
} from "@remix-run/cloudflare"
import { Form, useLoaderData, useNavigation } from "@remix-run/react"
import { commitSession, getSession } from "~/sessions"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/")
  }

  const data = { error: session.get("error") }

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { search, searchParams } = new URL(request.url)
  const session = await getSession(request.headers.get("Cookie"))
  const formData = await request.formData()
  const code = formData.get("code")
  if (code !== "676767") {
    session.flash("error", "Invalid code")
    return redirect(`/auth/login${search}`, {
      headers: { "Set-Cookie": await commitSession(session) }
    })
  }

  let path = "/"
  const redirectUrl = searchParams.get("redirect_url")
  if (redirectUrl) {
    path = new URL(redirectUrl).pathname
  }
  session.set("userId", "1234")

  return redirect(path, {
    headers: { "Set-Cookie": await commitSession(session) }
  })
}

export default function Login() {
  const navigation = useNavigation()
  const { error } = useLoaderData<typeof loader>()
  return (
    <div className="mx-auto py-8 px-2 max-w-lg h-screen">
      {error ? (
        <div
          className="text-red-500 rounded p-2 bg-red-500/20 border border-red-500"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <Form method="post" className="mt-4">
        <fieldset
          disabled={navigation.state === "submitting"}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="code"
            name="code"
            className="border-2 border-gray-300 px-1 py-1 rounded focus:border-blue-600 outline-none"
          />
          <button className="bg-blue-600 text-gray-100 px-2 py-1 rounded">
            Login
          </button>
        </fieldset>
      </Form>
    </div>
  )
}
