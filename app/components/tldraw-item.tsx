import { Form, Link, useNavigation } from "@remix-run/react"
import clsx from "clsx"
import { Check, Pencil } from "lucide-react"
import { useEffect, useState } from "react"
import { FileItem as TFileItem } from "~/schema"
import { Input } from "./input"

export const TldrawItem = ({ item }: { item: TFileItem }) => {
  const navigation = useNavigation()
  const _action = navigation.formData?.get("_action")

  const isBeingModified =
    navigation.formAction === "/?index" &&
    navigation.formData?.get("id") === item.id &&
    navigation.state === "submitting"

  const _busyDeleting = _action === "delete" && isBeingModified

  const busyEditing = _action === "edit" && isBeingModified
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!busyEditing) {
      setEditing(false)
    }
  }, [busyEditing])

  return (
    <div key={item.id} className="flex justify-between items-center">
      {editing ? (
        <Form method="post" id="edit-filename-form">
          <input type="hidden" name="id" value={item.id} />
          <Input
            className="text-sm h-6"
            defaultValue={item.name}
            name="name"
            disabled={busyEditing}
          />
        </Form>
      ) : (
        <Link
          to={`/${item.id}`}
          className="text-blue-600 hover:underline inline-block w-max"
        >
          {item.name}
        </Link>
      )}
      <div className="flex gap-2 items-center">
        {editing ? (
          <button
            aria-label="save filename"
            className="bg-lime-500 p-1 rounded stroke-white disabled:bg-gray-400 disabled:stroke-gray-300 disabled:cursor-not-allowed"
            form="edit-filename-form"
            name="_action"
            value="edit"
            type="submit"
            disabled={busyEditing}
          >
            <Check className="w-4 h-4 stroke-inherit" />
          </button>
        ) : (
          <button
            aria-label="toggle edit filename"
            className="bg-amber-500 p-1 rounded"
            onClick={() => setEditing(true)}
            type="button"
            key="toggle-edit"
          >
            <Pencil className="w-4 h-4 stroke-white" />
          </button>
        )}
        <Form method="post" action="/?index">
          <input type="hidden" name="id" value={item.id} />
          <button
            name="_action"
            value="delete"
            className={clsx(
              "text-red-400 underline text-sm hover:text-red-500 disabled:text-gray-400"
            )}
            // disabled={busyDeleting}
            disabled
          >
            Delete
          </button>
        </Form>
      </div>
    </div>
  )
}
