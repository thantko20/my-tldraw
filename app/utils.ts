import { json } from "@remix-run/cloudflare"
import { ZodError } from "zod"

export const handleActionError = async (error: unknown) => {
  if (error instanceof Response) {
    if (error.status >= 500) {
      console.log("Unknown Error", error)
    }

    const err = {
      message: await error.text(),
      errors: {}
    }

    return json(err, error.status)
  }

  if (error instanceof ZodError) {
    return json(
      {
        errors: error.flatten().fieldErrors,
        message: "Validation Error"
      },
      400
    )
  }

  if (error instanceof Error) {
    return json({ message: error.message, errors: {} }, 500)
  }

  return json({ message: "Unknown Error", errors: {} }, 500)
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
