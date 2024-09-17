import { Form, Link, useNavigation } from "@remix-run/react"
import { Check, Pencil } from "lucide-react"
import { ElementRef, useEffect, useRef, useState } from "react"
import { FileItem as TFileItem } from "~/schema"
import { Input } from "./input"
import { tick } from "~/utils"
import { DeleteTldrawDialog } from "./delete-tldraw-dialog"

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
  const editInputRef = useRef<ElementRef<"input">>(null)

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
            ref={editInputRef}
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
            onClick={async () => {
              setEditing(true)
              await tick()
              editInputRef.current?.focus()
            }}
            type="button"
            key="toggle-edit"
          >
            <Pencil className="w-4 h-4 stroke-white" />
          </button>
        )}
        <DeleteTldrawDialog tldrawItem={item} />
      </div>
    </div>
  )
}
