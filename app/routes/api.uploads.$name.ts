import { ActionFunctionArgs, json } from "@remix-run/cloudflare"

export const action = async ({
  request,
  context,
  params
}: ActionFunctionArgs) => {
  if (request.method === "PUT") {
    const blob = await request.blob()
    const r2Object = await context.cloudflare.env.ASSETS_BUCKET.put(
      `${params.name}`,
      blob,
      {
        httpMetadata: {
          contentType: blob.type
        }
      }
    )
    if (!r2Object) {
      return json({ errors: {}, message: "Failed to upload assets" }, 500)
    }
    return json({
      url: `${context.cloudflare.env.R2_ASSETS_BUCKET_PATH}/${params.name}`
    })
  }
}
