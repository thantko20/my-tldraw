import { createCookieSessionStorage } from "@remix-run/cloudflare"

type SessionData = {
  userId: string
}

type SessionFlashData = {
  error: string
}

const { getSession, destroySession, commitSession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      secrets: [process.env.SESSION_SECRET!],
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  })

export { getSession, destroySession, commitSession }
