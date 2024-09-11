import { json } from "@remix-run/cloudflare"
import { ZodError } from "zod"

export const handleActionError = (error: unknown) => {
  if (error instanceof Response) {
    if (error.status >= 500) {
      throw error
    }

    return json({ error: error.statusText, status: "error" }, error.status)
  }

  if (error instanceof ZodError) {
    return json(
      {
        error: error.flatten().formErrors[0],
        status: "error"
      },
      400
    )
  }

  throw error
}
