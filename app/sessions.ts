import { createCookieSessionStorage } from "@remix-run/cloudflare"

type SessionData = {
  userId: string
}

type SessionFlashData = {
  error: string
}

export const createSessionStorage = (env: Env) => {
  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      secrets: [env.SESSION_SECRET],
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  })
}
