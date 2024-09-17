import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { Form, useNavigation } from "@remix-run/react"
import clsx from "clsx"
import { useState } from "react"
import { FileItem } from "~/schema"

type Props = {
  tldrawItem: FileItem
}

export function DeleteTldrawDialog({ tldrawItem: item }: Props) {
  const [open, setOpen] = useState(false)
  const navigation = useNavigation()
  const busyDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("id") === item.id &&
    navigation.formData.get("_action") === "delete"
  return (
    <>
      <button
        className={clsx(
          "text-red-400 underline text-sm hover:text-red-500 disabled:text-gray-400"
        )}
        onClick={() => setOpen(true)}
      >
        Delete
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-2 transition duration-300 ease-out data-[closed]:opacity-0"
      >
        <DialogPanel className="max-w-lg space-y-4 bg-white p-6 rounded">
          <DialogTitle className="font-bold">Delete Item</DialogTitle>
          <p>
            File cannot be recovered after deletion. Click{" "}
            <span className="font-bold">Confirm</span> to proceed
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setOpen(false)}
              className="bg-blue-600 text-gray-100 px-2 py-1 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={busyDeleting}
            >
              Cancel
            </button>

            <Form method="post" action="/?index">
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                name="_action"
                value="delete"
                className={clsx(
                  "bg-red-600 text-gray-100 px-2 py-1 rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                )}
                disabled={busyDeleting}
              >
                Confirm
              </button>
            </Form>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}
