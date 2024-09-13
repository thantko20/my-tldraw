import { json } from "@remix-run/cloudflare"
import { ZodError } from "zod"

export const handleActionError = async (error: unknown) => {
  if (error instanceof HttpException) {
    if (error.status >= 500) {
      throw error
    }

    return json({ message: error.message, errors: error.errors }, error.status)
  }

  if (error instanceof ZodError) {
    return json({ message: "ValidationError", errors: error.errors }, 400)
  }

  return json({ message: "Unknown Error", errors: {} }, 500)
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

export class HttpException extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors: Record<string, string> = {}
  ) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
  }
}
