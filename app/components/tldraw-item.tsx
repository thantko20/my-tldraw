import { Form, Link, useNavigation } from "@remix-run/react"
import clsx from "clsx"
import { FileItem as TFileItem } from "~/schema"

export const TldrawItem = ({ item }: { item: TFileItem }) => {
  const navigation = useNavigation()
  const _busyDeleting =
    navigation.formAction === "/?index" &&
    navigation.formData?.get("_action") === "delete" &&
    navigation.formData?.get("id") === item.id
  return (
    <div key={item.id} className="flex justify-between items-center">
      <Link
        to={`/${item.id}`}
        className="text-blue-600 hover:underline inline-block w-max"
      >
        {item.name}
      </Link>
      <Form method="post" action="/?index">
        <input type="hidden" name="id" value={item.id} />
        <button
          name="_action"
          value="delete"
          className={clsx(
            "text-red-400 underline text-sm hover:text-red-500 disabled:text-gray-400"
          )}
          disabled={true}
        >
          Delete
        </button>
      </Form>
    </div>
  )
}
