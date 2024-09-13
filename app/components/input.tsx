import { Input as HeadlessInput, InputProps } from "@headlessui/react"
import clsx from "clsx"
import { forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeadlessInput
        ref={ref}
        className={clsx(
          "border-2 border-gray-300 px-1 py-1 rounded focus:border-blue-600 outline-none disabled:text-gray-600",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
