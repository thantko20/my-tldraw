import { type MetaFunction } from "@remix-run/cloudflare"
import { Form, json, Link, useLoaderData } from "@remix-run/react"
import "tldraw/tldraw.css"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

export const loader = async () => {
  return json({ files: ["testing"] })
}

export const action = async () => {
  // const formData = await request.formData()
  // const result = schema.safeParse(Object.fromEntries(formData))
  // if (!result.success) {
  //   return new Response(JSON.stringify(result.error), {
  //     status: 400,
  //     headers: {
  //       "Content-Type": "application/json"
  //     }
  //   })
  // }
  return json({ message: "success" })
}

export default function Index() {
  const { files } = useLoaderData<typeof loader>()
  return (
    <div>
      <Form method="post">
        <input name="name" type="text" placeholder="Enter name" />
      </Form>
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <Link
            key={file}
            to={`/draw/${file}`}
            className="text-blue-700 hover:underline w-min"
          >
            {file}
          </Link>
        ))}
      </div>
    </div>
  )
}
