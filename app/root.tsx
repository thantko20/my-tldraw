import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation
} from "@remix-run/react"
import "./tailwind.css"
import { Transition } from "@headlessui/react"

function Loader() {
  const navigation = useNavigation()
  return (
    <Transition
      show={navigation.state === "loading"}
      enterFrom="-top-8"
      enterTo="top-4"
      leaveFrom="top-4"
      leaveTo="-top-8"
    >
      <div className="absolute duration-150 top-4 left-[50%] z-[9999]">
        <div className="loader"></div>
      </div>
    </Transition>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Loader />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
