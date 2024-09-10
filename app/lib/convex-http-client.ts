import { ConvexHttpClient } from "convex/browser"

export const convexHttpClient = new ConvexHttpClient(process.env.CONVEX_URL!)
