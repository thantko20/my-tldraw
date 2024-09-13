import { Input as HeadlessInput, InputProps } from "@headlessui/react"
import clsx from "clsx"

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <HeadlessInput
      className={clsx(
        "border-2 border-gray-300 px-1 py-1 rounded focus:border-blue-600 outline-none",
        className
      )}
      {...props}
    />
  )
}
